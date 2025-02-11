from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from profiles.models import Companies, Profile


# from ..testing.models import Exam

# Для создания
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
            "date_exam": date.today().isoformat(),
            "name_intern": "Тестовый Стажер",
            "company": self.company.pk,
            "training_form": 'ВО',
            "try_count": 1,
            "name_train": self.user.pk,
            "internal_test_examiner": self.user.pk,
            "note": 'Тестовое примечание'
        }

    def tearDown(self):
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



# TODO Написать тесты на проверку изменения полей, от имени админа КЦ
# Изменяемые поля те же, которые используются при создании зачета

# TODO Написать тесты на проверку изменения полей, от имени админа ДМ
# Изменяемые поля вместе с ошибками описаны ниже

'''
Поля  дата время и имя проверяющего не должны быть дублем
"non_field_errors": [
        "Проверяющий уже занят в данную дату и время."
    ]
'''

'''
Поля  время не должны быть дублем
"time_exam": [
    "Пожалуйста, укажите время зачета"
],
'''

'''
Поля  принимающий не должны быть дублем
"name_examiner": [
    "Пожалуйста, укажите ФИ принимающего"
]
'''