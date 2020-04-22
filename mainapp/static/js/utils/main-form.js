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

// Генерирует поле для ввода переменной
var getVarHtml = function (name) {
  const id = '_' + Math.random().toString(36).substr(2, 9);
  return '<div class="form-group row variable">' +
    '  <label for="var' + id + '" class="col-form-label">' + name + '</label>' +
    '  <div class="control-group input-with-button">' +
    '    <input id="var' + id + '" type="text" class="form-control">' +
    '    <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '  </div>' +
    '</div>';
}

// Установка заданного количества переменных
var setVarQty = function (qty) {

  // Блок инпутов
  var varBlock = $('.main-form .variables-block');

  // Текущее количество переменных
  var currQty = varBlock.find('.variable').length;

  if (qty > currQty) { // добавление переменной 
    let diff = qty - currQty;
    if (currQty === 0) {
      varBlock.append(getVarHtml('Y'));
      diff--;
    }
    for (let i = diff; i > 0; i--)
      varBlock.append(getVarHtml('X' + (qty - i)));
  } else { // удаление переменной
    let diff = currQty - qty;
    for (let i = 0; i < diff; i++)
      varBlock.find('.variable:last').remove();
    return;
  }

  // Заполение пустых переменной числами
  varBlock.find('.variable').each(function () {
    if ($(this).find('.input-with-button input').val() === '')
      setVarSize($(this), $("#arrSize").val());
  });
}

// Установить размер переменной
var setVarSize = function (variable, size) {

  // Генерирует случайный идентификатор
  var randomFloat = function () { return (Math.random() * (50 - 1) + 1).toFixed(1) };

  // Текущий инпут
  var input = variable.find('.input-with-button input');

  // Текущий размер переменной
  var currSize = 0;
  var elements = input.val().match(/\d+\.?\d*/g);
  if (elements)
    currSize = elements.length;
  else
    elements = [];

  if (size > currSize) { // добавление числа 
    for (let i = 0; i < size - currSize; i++)
      elements.push(randomFloat());
  } else { // удаление числа
    for (let i = 0; i < currSize - size; i++)
      elements.pop();
  }

  // Заполнение текущего инпута значениями из массива
  input.val(elements.join(' '));
}

// Получение параметров из URL
var getAllUrlParams = function () {

  // get query string from url (optional) or window
  var queryString = window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

// Начальное состояние формы
params = getAllUrlParams();
params_len = Object.keys(params).length;

// URL без параметров - рандом 
if (!params_len)
  setVarQty($("#varQty").val());

// URL с параметрами, заполнение формы 
else {

  // Блок инпутов
  var varBlock = $('.main-form .variables-block');

  // Установка значений полей счетчиков
  $("#varQty").val(params_len);
  $("#arrSize").val(params.y.split('%20').length);

  // Заполнение формы переменными
  for (let [key, value] of Object.entries(params)) {
    varBlock.append(getVarHtml(key.toUpperCase()));
    varBlock.find('.variable:last .input-with-button input').val(value.split('%20'));
  }
}

// Установка заданного размера переменых
$('.main-form .variables-block').find('.variable').each(function () {
  setVarSize($(this), $("#arrSize").val());
});

// Изменение количества переменных
$("#varQty").change(function () {

  if ($(this).val() === "")
    $(this).val(0);

  if (parseInt($(this).val()) <= parseInt($(this).attr('max')))
    setVarQty($(this).val());

});

// Изменение размера переменных
$("#arrSize").change(function () {

  if ($(this).val() === "")
    $(this).val(0);

  if (parseInt($(this).val()) > parseInt($(this).attr('max')))
    return;

  var size = $(this).val();

  // Блок инпутов
  var varBlock = $('.main-form .variables-block');

  // Установка заданного размера переменых
  varBlock.find('.variable').each(function () {
    setVarSize($(this), size);
  });
});

// Удалить текущую переменную
$(document).on('click', '.close', function () {
  var variable = $(this).closest('.variable');

  // Определение индекса текущего элемента
  var index = variable.find('label').text().match(/X(\d+)/);
  index = index ? parseInt(index[1]) : 0;

  // Обновление индексов следующих элементов
  variable.nextAll().each(function () {
    $(this).find('label').text(index == 0 ? 'Y' : 'X' + index);
    index++;
  });

  // Удаление текущего элемента
  variable.remove();

  // Обновление значения в поле
  $("#varQty").val(parseInt($("#varQty").val()) - 1);

});

// Отключение фокуса на кнопках закрытия
$(document).on('focus', '.close', function () {
  $(this).blur();
});

// Событие отправки формы
$(".main-form").submit(function (e) {

  // Прерывание отправки формы
  e.preventDefault();

  // Снятие фокуса с кнопки отправки
  $(this).find(':submit').blur();

  var data = [];
  var fixSize = parseInt($("#arrSize").val());
  var error = false;

  // Очистка предыдущих сообщений об ошибках
  $(this).find('.variables-block .variable').each(function () {
    $(this).find('label').removeClass('text-danger');
    $(this).find('.input-with-button input').removeClass('is-invalid');
    $(this).find('.input-with-button small.text-danger').each(function () {
      $(this).remove();
    })
  });

  // Проверка количества переменных
  if (parseInt($("#varQty").val()) < 2) {
    createAlert('danger', 'Минимальное количество переменных: 2');
    return;
  }

  // Проверка размера переменных
  if (parseInt($("#arrSize").val()) < 2) {
    createAlert('danger', 'Минимальный размер переменных: 2');
    return;
  }

  // Формирование массива переменных и превалидация
  $(this).find('.variables-block .variable .input-with-button input').each(function () {

    // Получение массива значений текущей переменной
    var newVar = [];
    $(this).val().split(/\s+/).forEach(function (el) {
      if (el !== '')
        newVar.push(parseFloat(el));
    });

    // Проверка длины массива и вывод сообщения об ошибке
    if (newVar.length !== fixSize) {
      error = true;
      var variable = $(this).closest('.variable');
      variable.find('label').addClass('text-danger');
      variable.find('.input-with-button input').addClass('is-invalid');
      variable.find('.input-with-button').append('<small class="text-danger">' +
        'Текущий размер переменой: ' + newVar.length + ', необходимо: ' + fixSize +
        '</small>');
    }

    data.push(newVar);
  });

  // Отправка POST запроса
  if (!error) {
    var csrftoken = $(this).find('[name="csrfmiddlewaretoken"]').val();
    $.ajax({
      type: "POST",
      url: "/calculate/",
      headers: { "X-CSRFToken": csrftoken },
      data: {
        'matrix': data
      },
      success: function (json) {

        // Уведомление об успешном завершении
        createAlert('success', 'Операция прошла успешно');

        // Вывод результатов
        if (!$(".main-form #outputArea").length) {
          $('.main-form').append('<div class="form-group" style="display: none">' +
            '<label for="outputArea">Вывод:</label>' +
            '<textarea class="form-control" id="outputArea" rows="10" readonly>' + json.res + '</textarea>' +
            '</div>');
          $(".main-form #outputArea").closest('.form-group').slideDown(500);
        } else
          $(".main-form #outputArea").closest('.form-group').hide(150, function () {
            $(this).find('#outputArea').text(json.res);
            $(this).show(150);
          });

        // Сохранение результатов вычислений в sessions
        $.ajax({
          type: "POST",
          url: "/history/",
          data: {
            'matrix': data,
            'result': json.res
          },
          success: function () {
            console.log('Результаты успешно сохранены');
          },
          error: function (data) {
            console.log('Ошибка сохранения результатов', data);
            createAlert('danger', 'Ошибка сохранения результатов');
          },
        });

      },
      error: function (data) {
        // Сообщение об ошибке
        createAlert('danger', 'Ошибка: ' + data.responseJSON.message);
        // Скрыть поле вывода
        $(".main-form #outputArea").closest('.form-group').hide(150);
      },
    });
  }

});