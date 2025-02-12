from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from profiles.models import Companies, Profile
from testing.models import Exam


class ExamApiViewTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.credentials = {
            'username': 'TestUser ',
            'password': 'qwerty'
        }
        cls.user = User.objects.create_user(**cls.credentials)
        cls.company = Companies.objects.create(
            name='test_company_kc_1',
            slug='kc_1',
            main_company=False
        )

        cls.profile = Profile.objects.create(
            user=cls.user,
            full_name='Test User 1',
            company=cls.company,
            post='Admin',
            work_start_date='2023-01-01',
            status='Работает'
        )

    @classmethod
    def tearDownClass(cls):
        cls.profile.delete()
        cls.company.delete()
        cls.user.delete()

    def setUp(self):
        self.client.login(**self.credentials)

        self.data = {
            'date_exam': date.today().isoformat(),
            'name_intern': "Тестовый Стажер",
            'company': self.company.pk,
            'training_form': 'ВО',
            'try_count': 1,
            'name_train': self.user.pk,
            'internal_test_examiner': self.user.pk,
            'note': 'Тестовое примечание'
        }

        self.exam = Exam.objects.create(
            date_exam=date.today().isoformat(),
            name_intern="Тестовый Стажер-Два",
            company=self.company,
            training_form='Универсал',
            try_count=1,
            name_train=self.user,
            internal_test_examiner=self.user,
            note='Тестовое примечание'
        )

    def tearDown(self):
        self.data.clear()
        self.exam.delete()

    def test_create_exam_valid_data(self):
        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json()

        self.assertEqual(status_code, 201)
        self.assertEqual(response_data, self.data)

    def test_create_exam_invalid_data(self):
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        self.data['date_exam'] = yesterday

        expected_answer = 'Дата зачета не может быть в прошлом'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('date_exam')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_data(self):
        self.data['date_exam'] = ''

        expected_answer = 'Пожалуйста, укажите дату экзамена.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('date_exam')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_invalid_name_intern(self):
        self.data['name_intern'] = 'Тестовый стажер'

        expected_answer = 'Введены некорректные данные, введите значение в формате: Фамилия Имя'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('name_intern')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_name_intern(self):
        self.data['name_intern'] = ''

        expected_answer = 'Пожалуйста, укажите ФИ стажера.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('name_intern')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_training_form(self):
        self.data['training_form'] = ''

        expected_answer = 'Пожалуйста, укажите форму обучения.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('training_form')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_try_count(self):
        self.data['try_count'] = ''

        expected_answer = 'Пожалуйста, укажите попытку.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('try_count')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_name_train(self):
        self.data['name_train'] = ''

        expected_answer = 'Пожалуйста, укажите фамилию обучающего.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('name_train')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_create_exam_blank_internal_test_examiner(self):
        self.data['internal_test_examiner'] = ''

        expected_answer = 'Пожалуйста, укажите фамилию принимающего зачет.'

        response = self.client.post(reverse('api-root:testing-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('internal_test_examiner')[0]

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_update_exam_invalid_data(self):
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        self.data = {
            "date_exam": yesterday,
            "name_intern": "Тестовый стажер",
            "company": self.company.pk,
            "training_form": '',
            "try_count": None,
            "name_train": '',
            "internal_test_examiner": '',
            "note": ''
        }
        expected_answer = {
            'date_exam': ['Дата зачета не может быть в прошлом'],
            'name_intern': ['Введены некорректные данные, введите значение в формате: Фамилия Имя'],
            'training_form': ['Пожалуйста, укажите форму обучения.'],
            'try_count': ['Пожалуйста, укажите попытку.'],
            'name_train': ['Пожалуйста, укажите фамилию обучающего.'],
            'internal_test_examiner': ['Пожалуйста, укажите фамилию принимающего зачет.']
        }
        response = self.client.patch(
            reverse(
                viewname='api-root:testing-detail',
                kwargs={'pk': self.exam.pk}
            ),
            data=self.data,
            content_type='application/json'
        )
        response_data = response.json()

        self.assertEqual(response_data, expected_answer)
        self.assertEqual(response.status_code, 400)

    def test_update_exam_valid_data(self):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        self.data = {
            "date_exam": tomorrow,
            "name_intern": "Измененный Стажер",
            "company": self.company.pk,
            "training_form": 'Универсал',
            "try_count": 2,
            "name_train": self.user.pk,
            "internal_test_examiner": self.user.pk,
            "note": 'Измененное примечание'
        }

        response = self.client.patch(
            reverse(
                'api-root:testing-detail',
                kwargs={'pk': self.exam.pk}
            ),
            data=self.data,
            content_type='application/json'
        )
        response_data = response.json()

        self.assertEqual(response_data, self.data)
        self.assertEqual(response.status_code, 201)


class ExamUpdateApiViewTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.admin_credentials = {
            'username': 'TestAdminDMUser ',
            'password': 'qwerty'
        }
        cls.credentials = {
            'username': 'TestUser ',
            'password': 'qwerty'
        }

        cls.admin_user = User.objects.create_user(**cls.admin_credentials)
        cls.user = User.objects.create_user(**cls.credentials)

        cls.main_company = Companies.objects.create(
            name='test_company_DM',
            slug='dm',
            main_company=True
        )
        cls.company = Companies.objects.create(
            name='test_company_kc_1',
            slug='kc_1',
            main_company=False
        )

        cls.admin_profile = Profile.objects.create(
            user=cls.admin_user,
            full_name='Admin Test User',
            company=cls.main_company,
            post='OKK',
            work_start_date='2022-01-01',
            status='Работает'
        )
        cls.profile = Profile.objects.create(
            user=cls.user,
            full_name='Test User 1',
            company=cls.company,
            post='Admin',
            work_start_date='2023-01-01',
            status='Работает'
        )

    @classmethod
    def tearDownClass(cls):
        cls.admin_profile.delete()
        cls.profile.delete()
        cls.main_company.delete()
        cls.company.delete()
        cls.admin_user.delete()
        cls.user.delete()

    def setUp(self):
        self.client.login(**self.admin_credentials)
        self.tomorrow = (date.today() + timedelta(days=2)).isoformat()
        self.data = {
            'date_exam': self.tomorrow,
            'try_count': 2,
            'time_exam': '15:00:00',
            'name_examiner': self.admin_user.pk,
            'result_exam': 'Допущен',
            'comment_exam': 'Успешная сдача зачета',
        }

        self.exam = Exam.objects.create(
            date_exam=date.today().isoformat(),
            name_intern="Тестовый Стажер",
            company=self.company,
            training_form='Универсал',
            try_count=1,
            name_train=self.user,
            internal_test_examiner=self.user,
            note='Тестовое примечание'
        )

    def tearDown(self):
        self.data.clear()
        self.exam.delete()

    def test_update_exam_valid_data(self):
        response = self.client.patch(
            reverse(
                viewname='api-root:update_exam-detail',
                kwargs={'pk': self.exam.pk}
            ),
            data=self.data,
            content_type='application/json'
        )

        expected_answer = {
            'id': 1,
            'name_train_full_name': 'Test User 1',
            'internal_test_examiner_full_name': 'Test User 1',
            'name_examiner_full_name': 'Admin Test User',
            'date_exam': self.tomorrow,
            'name_intern': 'Тестовый Стажер',
            'training_form': 'Универсал',
            'try_count': 2,
            'time_exam': '15:00:00',
            'result_exam': 'Допущен',
            'comment_exam': 'Успешная сдача зачета',
            'note': 'Тестовое примечание',
            'company': self.company.pk,
            'name_examiner': self.admin_user.pk,
            'name_train': self.user.pk,
            'internal_test_examiner': self.user.pk,
        }

        response_data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data, expected_answer)

    def test_update_exam_invalid_data(self):
        self.data = {
            'date_exam': None,
            'try_count': '',
            'time_exam': '',
            'name_examiner': None,
            'result_exam': '',
            'comment_exam': '',
        }

        expected_answer = {
            'time_exam': ['Пожалуйста, укажите время зачета'],
            'date_exam': 'Пожалуйста, укажите дату экзамена.',
            'name_examiner': ['Пожалуйста, укажите ФИ принимающего'],
            'try_count': ['Пожалуйста, укажите попытку']
        }

        response = self.client.patch(
            reverse(
                viewname='api-root:update_exam-detail',
                kwargs={'pk': self.exam.pk}
            ),
            data=self.data,
            content_type='application/json'
        )

        response_data = response.json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response_data, expected_answer)


# TODO Написать тесты на проверку получения списка зачетов админом КЦ
# Изменяемые поля те же, которые используются при создании зачета

# TODO Написать тесты на проверку получения списка зачетов админом ДМ
# Изменяемые поля те же, которые используются при создании зачета
