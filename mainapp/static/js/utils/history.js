/***
 * Copyright 2020 Alexander Pishchulev (https://github.com/BlasterAlex)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Удалить текущий результат
$(document).on('click', '.close', function () {

  hcard = $(this).closest('.history-card')

  // Определение индекса текущего элемента
  var index = $('.history-card').index(hcard)

  // Отправка запроса на удаление
  $.ajax({
    type: "DELETE",
    url: "/history/",
    data: {
      'index': index
    },
    success: function () {

      // Обновление индексов следующих элементов
      hcard.nextAll().each(function () {
        $(this).find('.card-header label').text('Результат ' + (index + 1));
        index++;
      });

      // Удаление текущего элемента
      hcard.remove();
      if ($('.history-card').length === 0) {
        $('.container .page h4:first').replaceWith('<h4>Сохраненных вычислений нет</h4>');
      }

    },
    error: function (data) {
      console.log('Ошибка удаления результата', data);
      createAlert('danger', 'Ошибка удаления результата ' + (index + 1));
    },
  });

});

// Отключение фокуса на кнопках закрытия
$(document).on('focus', '.close', function () {
  $(this).blur();
});

// Нажатие кнопки заполнения
$(document).on('click', '.fill-with-btn', function () {

  hcard = $(this).closest('.history-card')

  // Получение матрицы входных параметров с карты
  var params = ''
  hcard.find('.card-body .rows').each(function () {
    var name = $(this).prev().text().trim();
    var array = $(this).text().replace(/\[|\]|\,/g, '');
    params += name + '=' + array + '&';
  });
  params = params.replace(/&$/, '')

  location.href = '/?' + params;

});