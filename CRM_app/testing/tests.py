from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from profiles.models import Companies, Profile
from testing.models import Exam


class BaseExamApiViewTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.admin_credentials = {
            'username': 'TestAdminDMUser ',
            'password': 'qwerty',
            'is_staff': True
        }
        cls.credentials_kc_1 = {
            'username': 'TestUse_kc1 ',
            'password': 'qwerty'
        }
        cls.credentials_kc_2 = {
            'username': 'TestUser_kc2 ',
            'password': 'qwerty'
        }

        cls.admin_user = User.objects.create_user(**cls.admin_credentials)
        cls.user_kc1 = User.objects.create_user(**cls.credentials_kc_1)
        cls.user_kc2 = User.objects.create_user(**cls.credentials_kc_2)

        cls.main_company = Companies.objects.create(
            name='test_company_DM',
            slug='dm',
            main_company=True
        )
        cls.company_kc1 = Companies.objects.create(
            name='test_company_kc_1',
            slug='kc_1',
            main_company=False
        )
        cls.company_kc2 = Companies.objects.create(
            name='test_company_kc_2',
            slug='kc_2',
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
        cls.profile_kc1 = Profile.objects.create(
            user=cls.user_kc1,
            full_name='Test User kc1',
            company=cls.company_kc1,
            post='Admin',
            work_start_date='2023-01-01',
            status='Работает'
        )
        cls.profile_kc2 = Profile.objects.create(
            user=cls.user_kc2,
            full_name='Test User kc2',
            company=cls.company_kc2,
            post='Admin',
            work_start_date='2023-02-02',
            status='Работает'
        )

    @classmethod
    def tearDownClass(cls):
        cls.admin_profile.delete()
        cls.profile_kc1.delete()
        cls.profile_kc2.delete()
        cls.main_company.delete()
        cls.company_kc1.delete()
        cls.company_kc2.delete()
        cls.admin_user.delete()
        cls.user_kc1.delete()
        cls.user_kc2.delete()

    def setUp(self):
        self.exam_1 = Exam.objects.create(
            date_exam=date.today().isoformat(),
            name_intern="Тестовый Стажер",
            company=self.company_kc1,
            training_form='Универсал',
            try_count=1,
            name_train=self.user_kc1,
            internal_test_examiner=self.user_kc1,
            note='Тестовое примечание'
        )

        self.exam_2 = Exam.objects.create(
            date_exam=date.today().isoformat(),
            name_intern="Тестовый Стажер КЦ 2",
            company=self.company_kc2,
            training_form='ВО',
            try_count=2,
            name_train=self.user_kc2,
            internal_test_examiner=self.user_kc2,
            note='Тестовое примечание'
        )

        self.exam_3 = Exam.objects.create(
            date_exam=date.today().isoformat(),
            name_intern="Тестовый Стажер 2",
            company=self.company_kc1,
            training_form='Универсал',
            try_count=1,
            name_train=self.user_kc1,
            internal_test_examiner=self.user_kc1,
            note=''
        )

    def tearDown(self):
        self.exam_1.delete()
        self.exam_2.delete()
        self.exam_3.delete()

class ExamApiViewTestCase(BaseExamApiViewTestCase):

    def setUp(self):
        super().setUp()
        self.client.login(**self.credentials_kc_1)
        self.data = {
            'date_exam': date.today().isoformat(),
            'name_intern': "Тестовый Стажер",
            'company': self.company_kc1.pk,
            'training_form': 'ВО',
            'try_count': 1,
            'name_train': self.user_kc1.pk,
            'internal_test_examiner': self.user_kc1.pk,
            'note': 'Тестовое примечание'
        }

    def tearDown(self):
        super().tearDown()
        self.data.clear()

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
            "company": self.company_kc1.pk,
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
                kwargs={'pk': self.exam_1.pk}
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
            "company": self.company_kc1.pk,
            "training_form": 'Универсал',
            "try_count": 2,
            "name_train": self.user_kc1.pk,
            "internal_test_examiner": self.user_kc1.pk,
            "note": 'Измененное примечание'
        }

        response = self.client.patch(
            reverse(
                'api-root:testing-detail',
                kwargs={'pk': self.exam_1.pk}
            ),
            data=self.data,
            content_type='application/json'
        )
        response_data = response.json()

        self.assertEqual(response_data, self.data)
        self.assertEqual(response.status_code, 201)

    def test_exam_list_user_kc_1(self):
        response = self.client.get(reverse('api-root:testing-list'))
        response_data = response.json()

        status_code = response.status_code
        expected_count_exam = Exam.objects.filter(company=self.company_kc1.pk).count()
        response_count = response_data.get('count')

        expected_company_name = self.company_kc1.pk

        response_data_1 = response.json().get('results')[0].get('company')
        response_data_2 = response.json().get('results')[1].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_exam, response_count)
        self.assertEqual(response_data_1, expected_company_name)
        self.assertEqual(response_data_2, expected_company_name)

    def test_exam_list_user_kc_2(self):
        self.client.logout()
        self.client.login(**self.credentials_kc_2)
        response = self.client.get(reverse('api-root:testing-list'))
        response_data = response.json()

        status_code = response.status_code
        expected_count_exam = Exam.objects.filter(company=self.company_kc2.pk).count()
        response_count = response_data.get('count')
        expected_company_name = self.company_kc2.pk
        response_data = response.json().get('results')[0].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_exam, response_count)
        self.assertEqual(response_data, expected_company_name)

    def test_list_exam_admin_user_kc_1(self):
        params = {'company': self.company_kc1.slug}

        self.client.logout()
        self.client.login(**self.admin_credentials)

        response = self.client.get(reverse('api-root:testing-list'), data=params)

        response_data = response.json()

        status_code = response.status_code
        expected_count_exam = Exam.objects.filter(company=self.company_kc1.pk).count()
        response_count = response_data.get('count')

        expected_company_name = self.company_kc1.pk

        response_data_1 = response.json().get('results')[0].get('company')
        response_data_2 = response.json().get('results')[1].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_exam, response_count)
        self.assertEqual(response_data_1, expected_company_name)
        self.assertEqual(response_data_2, expected_company_name)

    def test_list_exam_admin_user_kc_2(self):
        params = {'company': self.company_kc2.slug}

        self.client.logout()
        self.client.login(**self.admin_credentials)

        response = self.client.get(reverse('api-root:testing-list'), data=params)

        response_data = response.json()

        status_code = response.status_code
        expected_count_exam = Exam.objects.filter(company=self.company_kc2.pk).count()
        response_count = response_data.get('count')
        expected_company_name = self.company_kc2.pk
        response_data = response.json().get('results')[0].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_exam, response_count)
        self.assertEqual(response_data, expected_company_name)

    def test_list_my_exam(self):
        params = {'mode': 'my-exam'}
        now = timezone.now()
        self.client.logout()
        self.client.login(**self.admin_credentials)

        data_1 = {'name_examiner': self.admin_user.pk, 'time_exam': '15:00:00', 'try_count': 1}
        data_2 = {'name_examiner': self.admin_user.pk, 'time_exam': '16:00:00', 'try_count': 2}

        self.client.patch(
            reverse(
                'api-root:update_exam-detail',
                kwargs={'pk': self.exam_1.pk}
            ),
            data=data_1,
            content_type='application/json'
        )

        self.client.patch(
            reverse(
                'api-root:update_exam-detail',
                kwargs={'pk': self.exam_2.pk}
            ),
            data=data_2,
            content_type='application/json'
        )

        response = self.client.get(reverse('api-root:testing-list'), data=params)
        response_data = response.json()


        expected_count_exam = Exam.objects.filter(name_examiner=self.admin_user.pk, result_exam='', date_exam=now).count()
        expected_company_pk_1 = Exam.objects.filter(name_examiner=self.admin_user.pk, result_exam='', date_exam=now)[0].company.pk
        expected_company_pk_2 = Exam.objects.filter(name_examiner=self.admin_user.pk, result_exam='', date_exam=now)[1].company.pk

        company_pk_1 = response_data.get('results')[0].get('company')
        company_pk_2 = response_data.get('results')[1].get('company')

        response_count = response_data.get('count')
        response_code = response.status_code

        self.assertEqual(response_code, 200)
        self.assertEqual(response_count, expected_count_exam)
        self.assertEqual(company_pk_1, expected_company_pk_1)
        self.assertEqual(company_pk_2, expected_company_pk_2)

class ExamUpdateApiViewTestCase(BaseExamApiViewTestCase):

    def setUp(self):
        super().setUp()
        self.client.login(**self.admin_credentials)
        self.tomorrow = (date.today() + timedelta(days=1)).isoformat()
        self.data = {
            'date_exam': self.tomorrow,
            'try_count': 2,
            'time_exam': '15:00:00',
            'name_examiner': self.admin_user.pk,
            'result_exam': 'Допущен',
            'comment_exam': 'Успешная сдача зачета',
        }

    def tearDown(self):
        super().tearDown()
        self.data.clear()

    def test_update_exam_valid_data(self):
        response = self.client.patch(
            reverse(
                viewname='api-root:update_exam-detail',
                kwargs={'pk': self.exam_1.pk}
            ),
            data=self.data,
            content_type='application/json'
        )

        expected_answer = {
            'id': 1,
            'name_train_full_name': 'Test User kc1',
            'internal_test_examiner_full_name': 'Test User kc1',
            'name_examiner_full_name': 'Admin Test User',
            'date_exam': self.tomorrow,
            'name_intern': 'Тестовый Стажер',
            'training_form': 'Универсал',
            'try_count': 2,
            'time_exam': '15:00:00',
            'result_exam': 'Допущен',
            'comment_exam': 'Успешная сдача зачета',
            'note': 'Тестовое примечание',
            'company': self.company_kc1.pk,
            'name_examiner': self.admin_user.pk,
            'name_train': self.user_kc1.pk,
            'internal_test_examiner': self.user_kc1.pk,
        }

        response_data = response.json()
        status_code = response.status_code

        self.assertEqual(status_code, 200)
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
                kwargs={'pk': self.exam_1.pk}
            ),
            data=self.data,
            content_type='application/json'
        )

        response_data = response.json()
        status_code = response.status_code

        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)
