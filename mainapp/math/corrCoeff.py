
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

import math
import numpy as np
from scipy.stats import t as T


# Форматированный вывод матрицы
def matprint(mat, fmt="g"):
    resStr = ''
    col_maxes = [max([len(("{:"+fmt+"}").format(x))
                      for x in col]) for col in mat.T]
    for x in mat:
        for i, y in enumerate(x):
            resStr += ("{:"+str(col_maxes[i])+fmt+"}").format(y) + '  '
        resStr += '\n'

    return resStr.replace('  \n', '\n')


# Вычисление обратной матрицы методом Гаусса
def rref(matrix):
    matrix = np.array(matrix)
    [n, m] = matrix.shape

    def pick_nonzero_row(matrix, k):
        while k < m and not matrix[k, k]:
            k += 1
        return k

    # forward trace
    for k in range(n):
        # 1) Swap k-row with one of the underlying if matrix[k, k] = 0
        swap_row = pick_nonzero_row(matrix, k)
        if swap_row != k:
            matrix[k, :], matrix[swap_row,
                                 :] = matrix[swap_row, :], np.copy(matrix[k, :])
        # 2) Make diagonal element equals to 1
        if matrix[k, k] != 1:
            matrix[k, :] *= 1 / matrix[k, k]
        # 3) Make all underlying elements in column equal to zero
        for row in range(k + 1, n):
            matrix[row, :] -= matrix[k, :] * matrix[row, k]

    # backward trace
    for k in range(n - 1, 0, -1):
        for row in range(k - 1, -1, -1):
            if matrix[row, k]:
                # 1) Make all overlying elements equal to zero in the former identity matrix
                matrix[row, :] -= matrix[k, :] * matrix[row, k]

    return matrix


# Вычисление коэффициентов корреляции для входной матрицы
def calculate(A):
    [N, M] = A.shape

    resStr = ''

    # Матрица парных коэффициентов корреляции
    resStr += 'Матрица парных коэффициентов корреляции:\n\n'
    pairCorrCoef = np.corrcoef(A)
    resStr += matprint(pairCorrCoef)
    resStr += '\n'

    # Определение имен переменных
    vars = ['Y']
    for i in range(1, N):
        vars.append('X'+str(i))

    # Вычисление определителей
    dets = np.zeros_like(pairCorrCoef)
    for i in range(N):
        for j in range(N):
            temp = pairCorrCoef
            temp = np.delete(temp, (i), axis=0)
            temp = np.delete(temp, (j), axis=1)
            D = np.linalg.det(temp)
            dets[i][j] = D
            dets[j][i] = D

    # Функция распределения Стьюдента
    t = T.pdf(N-2, 5)

    # Определение зависимости
    resStr += 'Корреляционная зависимость:\n\n'
    for i in range(1, N):
        r = pairCorrCoef[0][i]
        tb = r * math.sqrt(N-2) / math.sqrt(1-math.pow(r, 2))
        if abs(tb) < t:
            resStr += vars[0] + vars[i] + ' - зависимости нет\n'
        else:
            if abs(r) < 0.3:
                resStr += vars[0] + vars[i] + ' - зависимость слабая\n'
            else:
                if abs(r) < 0.7:
                    resStr += vars[0] + vars[i] + \
                        ' - зависимость средняя\n'
                else:
                    resStr += vars[0] + vars[i] + \
                        ' - зависимость тесная\n'

    # Вычисление уравнения регрессии
    A.transpose()
    mm = []
    row_extra = []

    resStr += '\nУравнение множественной регрессии:\n\n'

    for i in range(N):
        mx_row = []

        for j in range(N):
            mx_row_sum = 0
            for k in range(M):
                mx_row_sum = mx_row_sum + A[i][k]*A[j][k]
            mx_row.append(mx_row_sum)

        mx_row_sum = np.sum(A[i])
        mx_row.append(mx_row_sum)
        row_extra.append(mx_row_sum)
        mm.append(mx_row)

    row_extra.append(N)
    mm.append(row_extra)

    mm_size = len(mm)
    system = []

    for i in range(mm_size):
        if not i == 0:
            row = []

            for k in range(mm_size):
                if not k == 0:
                    row.append(mm[i][k])

            row.append(mm[0][i])
            system.append(row)

    RR = rref(system)
    result = RR[:, -1]

    eqStr = vars[0] + ' = '

    # Вывод уравнения
    for k in range(N):
        eqStr += '%.2f' % result[k]
        if k < N-1:
            eqStr += ' * ' + vars[k+1] + ' + '

    resStr += eqStr.replace('+ -', '- ')

    return resStr
