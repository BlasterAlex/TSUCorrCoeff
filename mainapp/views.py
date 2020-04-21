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

import json
import re
import numpy as np
from django.shortcuts import render
from django.http import JsonResponse
from mainapp.math import corrCoeff


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
def history(request):

    # Добавление нового результата
    if request.is_ajax() and request.method == 'POST':
        try:
            # Считывание массива из request
            req_dict = dict(request.POST)
            matrix = []
            for key, value in req_dict.items():
                arr = re.findall('(.*)\[(\d+)\]\[\]', key)
                if arr:
                    name = arr[0][0]
                    if name == 'matrix':
                        matrix.append(value)

            # Формирование JSON объекта
            data = {"matrix": matrix, "result": req_dict['result'][0]}

            if 'coeff_history' in request.session:
                sessionHistory = request.session['coeff_history']
                sessionHistory.append(data)
                request.session['coeff_history'] = sessionHistory
            else:
                request.session['coeff_history'] = [data]

            return JsonResponse({"res": "OK"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)

    # Вывод текущего списка результатов
    elif request.method == 'GET':

        context = {}

        if 'coeff_history' in request.session:
            context['results'] = request.session['coeff_history']

        return render(request, 'history.html', context)
