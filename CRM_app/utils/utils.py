def replace_field_error_messages(errors):
    replacements = {
        'date_exam': 'Пожалуйста, укажите дату экзамена.',
        'name_intern': 'Пожалуйста, укажите ФИ стажера.',
        'company': 'Пожалуйста, укажите компанию.',
        'training_form': 'Пожалуйста, укажите форму обучения.',
        'try_count': 'Пожалуйста, укажите попытку.',
        'name_train': 'Пожалуйста, укажите фамилию обучающего.',
        'internal_test_examiner': 'Пожалуйста, укажите фамилию принимающего зачет.',
        'time_exam': 'Пожалуйста, укажите время зачета',
        'non_field_errors':'Проверяющий уже занят в данную дату и время',
        "operator_name": 'Пожалуйста, укажите имя оператора',
        "type_appeal": 'Пожалуйста, укажите тип обращения',
        "line": 'Пожалуйста, укажите линию',
        "call_date": 'Пожалуйста, укажите дату обращения',
        "call_id": 'Пожалуйста, укажите id обращения',
        "first_miss": 'Пожалуйста, укажите корректный вариант ошибки',
        "second_miss": 'Пожалуйста, укажите корректный вариант ошибки',
        "third_miss": 'Пожалуйста, укажите корректный вариант ошибки',
        "forty_miss": 'Пожалуйста, укажите корректный вариант ошибки',
        "fifty_miss": 'Пожалуйста, укажите корректный вариант ошибки',
        "sixty_miss": 'Пожалуйста, укажите корректный вариант ошибки'
    }

    expected_messages = [
        'This field may not be null.',
        'This field may not be blank.',
        'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
        'The fields date_exam, time_exam, name_examiner must make a unique set.',
        'is not a valid choice.',
        'Time has wrong format. Use one of these formats instead: hh:mm[:ss[.uuuuuu]].',
        'Incorrect type. Expected pk value, received str.'
    ]

    for field, messages in errors.items():
        if field in replacements:
            for i in range(len(messages)):
                for expected_message in expected_messages:
                    if expected_message in messages[i]:
                        messages[i] = replacements[field]