from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from profiles.models import Companies, Profile, Lines
from checklists.models import CheckList, Mistake, SubMistake


class BaseCheckListApiViewTestCase(TestCase):
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
        cls.credentials_oper_kc_1 = {
            'username': 'TestOperator_kc1 ',
            'password': 'qwerty'
        }
        cls.credentials_oper_kc_2 = {
            'username': 'TestOperator_kc2 ',
            'password': 'qwerty'
        }

        cls.admin_user = User.objects.create_user(**cls.admin_credentials)
        cls.user_kc1 = User.objects.create_user(**cls.credentials_kc_1)
        cls.user_kc2 = User.objects.create_user(**cls.credentials_kc_2)
        cls.user_oper_kc1 = User.objects.create_user(**cls.credentials_oper_kc_1)
        cls.user_oper_kc2 = User.objects.create_user(**cls.credentials_oper_kc_2)

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
        cls.profile_oper_kc1 = Profile.objects.create(
            user=cls.user_oper_kc1,
            full_name='Test Operator kc1',
            company=cls.company_kc1,
            post='Operator',
            work_start_date='2023-02-02',
            status='Работает'
        )
        cls.profile_oper_kc2 = Profile.objects.create(
            user=cls.user_oper_kc2,
            full_name='Test Operator kc2',
            company=cls.company_kc2,
            post='Operator',
            work_start_date='2023-02-02',
            status='Работает'
        )
        cls.mistake_1 = Mistake.objects.create(
            name='mistake 1',
            worth=5
        )
        cls.mistake_2 = Mistake.objects.create(
            name='mistake 2',
            worth=15
        )
        cls.mistake_3 = Mistake.objects.create(
            name='mistake 3',
            worth=15
        )
        cls.mistake_4 = Mistake.objects.create(
            name='mistake 4',
            worth=25
        )
        cls.mistake_5 = Mistake.objects.create(
            name='mistake 5',
            worth=50
        )
        cls.mistake_6 = Mistake.objects.create(
            name='mistake 6',
            worth=100
        )
        cls.submistake_1_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_1
        )
        cls.submistake_1_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_1
        )
        cls.submistake_2_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_2
        )
        cls.submistake_2_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_2
        )
        cls.submistake_3_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_3
        )
        cls.submistake_3_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_3
        )
        cls.submistake_4_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_4
        )
        cls.submistake_4_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_4
        )
        cls.submistake_5_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_5
        )
        cls.submistake_5_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_5
        )
        cls.submistake_6_1 = SubMistake.objects.create(
            name='1',
            attachment=cls.mistake_6
        )
        cls.submistake_6_2 = SubMistake.objects.create(
            name='mistake',
            attachment=cls.mistake_6
        )
        cls.line_1 = Lines.objects.create(
            name_line='line 1'
        )
        cls.line_2 = Lines.objects.create(
            name_line='line 2'
        )

    @classmethod
    def tearDownClass(cls):
        cls.admin_profile.delete()
        cls.profile_kc1.delete()
        cls.profile_kc2.delete()
        cls.profile_oper_kc1.delete()
        cls.profile_oper_kc2.delete()
        cls.main_company.delete()
        cls.company_kc1.delete()
        cls.company_kc2.delete()
        cls.admin_user.delete()
        cls.user_kc1.delete()
        cls.user_kc2.delete()
        cls.user_oper_kc1.delete()
        cls.user_oper_kc2.delete()
        cls.submistake_1_1.delete()
        cls.submistake_1_2.delete()
        cls.submistake_2_1.delete()
        cls.submistake_2_2.delete()
        cls.submistake_3_1.delete()
        cls.submistake_3_2.delete()
        cls.submistake_4_1.delete()
        cls.submistake_4_2.delete()
        cls.submistake_5_1.delete()
        cls.submistake_5_2.delete()
        cls.submistake_6_1.delete()
        cls.submistake_6_2.delete()
        cls.mistake_1.delete()
        cls.mistake_2.delete()
        cls.mistake_3.delete()
        cls.mistake_4.delete()
        cls.mistake_5.delete()
        cls.mistake_6.delete()
        cls.line_1.delete()
        cls.line_2.delete()

    def setUp(self):
        self.ch_list_1 = CheckList.objects.create(
            type_appeal='звонок',
            controller=self.admin_user,
            operator_name=self.user_oper_kc1,
            company=self.company_kc1,
            call_date=date.today(),
            call_time='17:30:00',
            call_id='qweqtag',
            first_miss=self.submistake_1_1,
            second_miss=self.submistake_2_1,
            third_miss=self.submistake_3_1,
            forty_miss=self.submistake_4_1,
            fifty_miss=self.submistake_5_1,
            sixty_miss=self.submistake_6_1,
            line=self.line_1
        )
        self.ch_list_2 = CheckList.objects.create(
            type_appeal='письма',
            controller=self.admin_user,
            operator_name=self.user_oper_kc1,
            company=self.company_kc1,
            call_date=date.today(),
            call_id='sfhdrtkjd',
            first_miss=self.submistake_1_2,
            second_miss=self.submistake_2_1,
            third_miss=self.submistake_3_2,
            forty_miss=self.submistake_4_1,
            fifty_miss=self.submistake_5_2,
            sixty_miss=self.submistake_6_1
        )
        self.ch_list_3 = CheckList.objects.create(
            type_appeal='письма',
            controller=self.admin_user,
            operator_name=self.user_oper_kc2,
            company=self.company_kc2,
            call_date=date.today(),
            call_id='asghaszdjh',
            first_miss=self.submistake_1_1,
            second_miss=self.submistake_2_1,
            third_miss=self.submistake_3_1,
            forty_miss=self.submistake_4_1,
            fifty_miss=self.submistake_5_1,
            sixty_miss=self.submistake_6_2
        )

    def tearDown(self):
        self.ch_list_1.delete()
        self.ch_list_2.delete()
        self.ch_list_3.delete()

class CheckListAdminApiViewTestCase(BaseCheckListApiViewTestCase):
    def setUp(self):
        super().setUp()
        self.client.login(**self.admin_credentials)
        self.data = {
            'type_appeal' : 'звонок',
            'operator_name' : self.user_oper_kc1.pk,
            'company' : self.company_kc1.pk,
            'call_date' : date.today(),
            'call_time' : '16:40:00',
            'call_id' : 'qwfaghah',
            'first_miss' : self.submistake_1_2.pk,
            'second_miss' : self.submistake_2_2.pk,
            'third_miss' : self.submistake_3_1.pk,
            'forty_miss' : self.submistake_4_1.pk,
            'fifty_miss' : self.submistake_5_1.pk,
            'sixty_miss' : self.submistake_6_1.pk,
            'line' : self.line_1.pk,
            'first_comm': 'Не представился',
            'second_comm': 'Не подробно рассказал про условия заказа'
        }

    def tearDown(self):
        super().tearDown()
        self.data.clear()

    def test_checklist_api_view_admin(self):
        params = {'company': self.company_kc1.slug, 'check_type': 'call'}
        response = self.client.get(reverse('api-root:ch-list-list'), data=params)
        response_data = response.json()

        status_code = response.status_code
        expected_count_checklist = CheckList.objects.filter(company=self.company_kc1.pk, type_appeal='звонок').count()
        response_count = response_data.get('count')
        expected_company_name = self.company_kc1.pk
        response_data_company_name = response_data.get('results')[0].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_checklist, response_count)
        self.assertEqual(response_data_company_name, expected_company_name)

    def test_add_checklist_admin_valid_data(self):
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json()
        self.assertEqual(status_code, 201)
        self.assertEqual(self.data.get('operator_name'), response_data.get('operator_name'))
        self.assertEqual(self.data.get('company'), response_data.get('company'))
        self.assertEqual(self.data.get('first_miss'), response_data.get('first_miss'))
        self.assertEqual(self.data.get('first_comm'), response_data.get('first_comm'))
        self.assertEqual(self.data.get('call_id'), response_data.get('call_id'))

    def test_add_checklist_admin_invalid_operator_name(self):
        self.data['operator_name'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('operator_name')[0]
        expected_answer = 'Пожалуйста, укажите имя оператора'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_company(self):
        self.data['company'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('company')[0]
        expected_answer = 'Пожалуйста, укажите компанию.'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_call_date(self):
        self.data['call_date'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('call_date')[0]
        expected_answer = 'Пожалуйста, укажите дату обращения'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_none_call_id(self):
        self.data['call_id'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('call_id')[0]
        expected_answer = 'Пожалуйста, укажите id обращения'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_first_miss(self):
        self.data['first_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('first_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_second_miss(self):
        self.data['second_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('second_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_third_miss(self):
        self.data['third_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('third_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_forty_miss(self):
        self.data['forty_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('forty_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_fifty_miss(self):
        self.data['fifty_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('fifty_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_sixty_miss(self):
        self.data['sixty_miss'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('sixty_miss')[0]
        expected_answer = 'Пожалуйста, укажите корректный вариант ошибки'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_line(self):
        self.data['line'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('line')[0]
        expected_answer = 'Пожалуйста, укажите линию.'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_invalid_type_appeal(self):
        self.data['type_appeal'] = "asdaw"
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('type_appeal')[0]
        expected_answer = '\"asdaw\" is not a valid choice.'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

    def test_add_checklist_admin_none_type_appeal(self):
        self.data['type_appeal'] = None
        response = self.client.post(reverse('api-root:ch-list-list'), data=self.data, content_type='application/json')
        status_code = response.status_code
        response_data = response.json().get('type_appeal')[0]
        expected_answer = 'Пожалуйста, укажите тип обращения'
        self.assertEqual(status_code, 400)
        self.assertEqual(response_data, expected_answer)

class CheckListAdminKcApiViewTestCase(BaseCheckListApiViewTestCase):
    def setUp(self):
        super().setUp()
        self.client.login(**self.credentials_kc_1)

    def tearDown(self):
        super().tearDown()

    def test_checklist_api_view_admin_kc(self):
        params = {'check_type': 'call'}
        response = self.client.get(reverse('api-root:ch-list-list'), data=params)
        response_data = response.json()

        status_code = response.status_code
        expected_count_checklist = CheckList.objects.filter(company=self.company_kc1.pk, type_appeal='звонок').count()
        response_count = response_data.get('count')
        expected_company_name = self.company_kc1.pk
        response_data_company_name = response_data.get('results')[0].get('company')

        self.assertEqual(status_code, 200)
        self.assertEqual(expected_count_checklist, response_count)
        self.assertEqual(response_data_company_name, expected_company_name)