"""
Copyright 2020 Alexander Pishchulev (https://github.com/BlasterAlex)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import re
import json
import timeago
import numpy as np
from datetime import datetime
from django.shortcuts import render
from django.http import QueryDict
from django.http import JsonResponse
from mainapp.math import corrCoeff
from django.views.decorators.csrf import csrf_exempt


# Главная страница
def index(request):
    return render(request, 'index.html')


# Вычисление коэффициентов
def coeff_calc(request):
    if request.is_ajax() and request.method == 'POST':

        # Считывание массива из request
        req_dict = dict(request.POST)
        matrix = []
        for key, value in req_dict.items():
            arr = re.findall('(.*)\[(\d+)\]\[\]', key)
            if arr:
                name = arr[0][0]
                if name == 'matrix':
                    matrix.append(np.array(value).astype(np.float))
        matrix = np.array(matrix)

        try:
            return JsonResponse({"res": corrCoeff.calculate(matrix)}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)

    else:
        return JsonResponse({"message": "Нечего делать"}, status=400)


# История вычислений
@csrf_exempt
def history(request):

    # Обработка запросов с фронта
    if request.is_ajax():

        # Добавление нового результата
        if request.method == 'POST':
            try:
                # Считывание массива из request
                req_dict = dict(request.POST)
                matrix = []
                for key, value in req_dict.items():
                    arr = re.findall('(.*)\[(\d+)\]\[\]', key)
                    if arr:
                        name = arr[0][0]
                        if name == 'matrix':
                            matrix.append(
                                np.array(value).astype(np.float).tolist()
                            )

                # Формирование JSON объекта
                data = {"matrix": matrix,
                        "result": req_dict['result'][0], "created": datetime.now().strftime("%d-%m-%Y %H:%M:%S.%f")}

                if 'coeff_history' in request.session:
                    sessionHistory = request.session['coeff_history']
                    sessionHistory.append(data)
                    request.session['coeff_history'] = sessionHistory
                else:
                    request.session['coeff_history'] = [data]

                return JsonResponse({"res": "OK"}, status=200)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=400)

        # Удаление результата из истории
        elif request.method == 'DELETE':
            try:
                delete = QueryDict(request.body)
                index = int(delete.get('index'))
                sessionHistory = request.session['coeff_history']
                del sessionHistory[index]
                request.session['coeff_history'] = sessionHistory
            except Exception as e:
                return JsonResponse({"message": str(e)}, status=400)

            return JsonResponse({"res": "OK"}, status=200)

    # Вывод текущего списка результатов
    elif request.method == 'GET':

        context = {}

        if 'coeff_history' in request.session:
            context['results'] = request.session['coeff_history']
        else:
            context['results'] = []

        # Обратная сортировка записей по дате создания
        createdReverse = sorted(
            context['results'],
            key=lambda x: datetime.strptime(x['created'], '%d-%m-%Y %H:%M:%S.%f'), reverse=True
        )

        # Вывод прошедшего времени
        now = datetime.now()
        for i, res in enumerate(createdReverse):
            created = datetime.strptime(res['created'], '%d-%m-%Y %H:%M:%S.%f')
            createdReverse[i]['created'] = timeago.format(
                created, now, 'ru')

        context['results'] = createdReverse

        return render(request, 'history.html', context)
