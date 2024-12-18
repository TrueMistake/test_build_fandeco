(function (window, document, $, authModalConfig) {
 var AuthModal = AuthModal || {} 

AuthModal.setup = function () {
    // selectors & $objects
    this.actionName = 'auth_action'
    this.action = ':submit[name=' + this.actionName + ']'
    this.form = '.auth_form'
    this.$doc = $(document)

    this.sendData = {
        $form: null,
        action: null,
        formData: null
    }

    this.timeout = 300
}


AuthModal.initialize = function () {


    AuthModal.setup()

    AuthModal.input.init()

    AuthModal.Placeholder.init()

    AuthModal.ajaxProgress = false

    AuthModal.$doc.ajaxStart(function () {
        AuthModal.ajaxProgress = true
    })
        .ajaxStop(function () {
            AuthModal.ajaxProgress = false
        })
        .on('submit', AuthModal.form, function (e) {
            e.preventDefault()
            var $form = $(this)
            var action = $form.find(AuthModal.action).val()

            if (action) {
                var formData = $form.serializeArray()
                formData.push({
                    name: AuthModal.actionName,
                    value: action
                })
                AuthModal.sendData = {
                    $form: $form,
                    action: action,
                    formData: formData
                }
                AuthModal.controller()
            }
        })

    $(document).on('click', AuthModal.form + ' button[type=submit]', function (e) {
        e.preventDefault()
        $(this).closest('form').submit()
    })

    // Демонстрация ввода в ручную
    $(document).on('keyup', '.auth_input', function () {
        AuthModal.input.set($(this).val())
    })

    function delay (callback, ms) {
        var timer = 0
        return function () {
            var context = this, args = arguments
            clearTimeout(timer)
            timer = setTimeout(function () {
                callback.apply(context, args)
            }, ms || 0)
        }
    }

    $(document).on('keyup', '.auth_input_code', delay(AuthModal.input.setAuthCode, 300))

    /**
     * Вернет к смене телефона
     */
    $(document).on('click', '.auth_forward', function (e) {
        e.preventDefault()
        AuthModal.Forward.toggle.call(this)
        AuthModal.Timer.resendCode()
    })
    /**
     * Вернет к смене телефона
     */
    $(document).on('click', '.auth_logout', function (e) {
        e.preventDefault()

        AuthModal.Forward.toggle.call(this)

    })

    /**
     * Вернет к смене телефона
     */
    $(document).on('click', '.auth_login', function (e) {
        e.preventDefault()
        AuthModal.Forward.toggle.call(this)
    })


    /**
     * Вернет к смене телефона
     */
    $(document).on('click', '.auth_resend_code', function (e) {
        e.preventDefault()
        AuthModal.Timer.resendCode()
    })

    AuthModal.Provider.init()

}

$(document).ready(function ($) {
    AuthModal.initialize()
})


/**
 * Общие функции
 */
AuthModal.Message = {
    /**
     * Выход с сайта
     */
    selector: '.auth_message',
    success: function (message) {
        this.add(message, 'auth_success')
    },
    error: function (message) {
        this.add(message, 'auth_error')
    },
    add: function (message, cls) {

        var $Form = $('.auth_form_active')

        var msg = $('<div class="auth_message"/>')
        msg.html(message).addClass(cls)

        $Form.find('.auth_buttons').after(msg)

        this.show()
    },
    hide: function () {
        $(this.selector).remove()
    },
    show: function () {
        $(this.selector).show()
    }
}

authModalConfig.callbacksObjectTemplate = function () {
    return {
        // return false to prevent send data
        before: [],
        response: {
            success: [],
            error: []
        },
        ajax: {
            done: [],
            fail: [],
            always: []
        }
    }
}

AuthModal.Callbacks = authModalConfig.Callbacks = {
    Auth: {
        logout: authModalConfig.callbacksObjectTemplate(),
        modal: authModalConfig.callbacksObjectTemplate(),
    },
    Settings: {
        profile: authModalConfig.callbacksObjectTemplate(),
        password: authModalConfig.callbacksObjectTemplate(),
        phone_change: authModalConfig.callbacksObjectTemplate(),
    },
    Phone: {
        code: authModalConfig.callbacksObjectTemplate(),
        confirmation: authModalConfig.callbacksObjectTemplate(),
        check: authModalConfig.callbacksObjectTemplate(),
    },
    Email: {
        login: authModalConfig.callbacksObjectTemplate(),
        passwordReset: authModalConfig.callbacksObjectTemplate(),
    },
    Provider: {
        interrogate: authModalConfig.callbacksObjectTemplate(),
    },
    NotificationInStock: {
        subscribe: authModalConfig.callbacksObjectTemplate(),
    },
}

AuthModal.Callbacks.add = function (path, name, func) {
    if (typeof func != 'function') {
        return false
    }
    path = path.split('.')
    var obj = AuthModal.Callbacks
    for (var i = 0; i < path.length; i++) {
        if (obj[path[i]] == undefined) {
            return false
        }
        obj = obj[path[i]]
    }
    if (typeof obj != 'object') {
        obj = [obj]
    }
    if (name != undefined) {
        obj[name] = func
    } else {
        obj.push(func)
    }
    return true
}

AuthModal.Callbacks.remove = function (path, name) {
    path = path.split('.')
    var obj = AuthModal.Callbacks
    for (var i = 0; i < path.length; i++) {
        if (obj[path[i]] == undefined) {
            return false
        }
        obj = obj[path[i]]
    }
    if (obj[name] != undefined) {
        delete obj[name]
        return true
    }
    return false
}

AuthModal.controller = function () {
    var self = this
    switch (self.sendData.action) {
        case 'auth/phone/code':
            AuthModal.Phone.code()
            break
        case 'auth/phone/confirmation':
            AuthModal.Phone.confirmation()
            break
        case 'auth/phone/check':
            AuthModal.Phone.check()
            break
        case 'auth/logout':
            AuthModal.Auth.logout()
            break

        case 'auth/email/login':
            AuthModal.Email.login()
            break
        case 'auth/email/password/reset':
            AuthModal.Email.passwordReset()
            break
        case 'auth/modal':
            AuthModal.Auth.modal()
            break

        case 'auth/settings/profile':
            AuthModal.Settings.profile()
            break
        case 'auth/settings/password':
            AuthModal.Settings.password()
            break
        case 'auth/settings/phone/change':
            AuthModal.Settings.phone_change()
            break
        case 'auth/interrogate': // Процедура опроса бэкенда на предмет авторизации
            AuthModal.Provider.interrogate()
            break
        case 'auth/service/subscribe': // Процедура опроса бэкенда на предмет авторизации
            AuthModal.NotificationInStock.subscribe()
            break

        default:
            console.log('Error not found action: ' + self.sendData.action)
            return
    }
}

AuthModal.Action = {
    ajaxSuccess: function (name, callback, send) {
        // Помещаем событие
        this.callbacks[name].response.success = callback
        this.ajax.call(this, name, send)
    },

    ajaxFail: function (name, callback, send) {
        this.callbacks[name].ajax.fail = callback
        this.ajax.call(this, name, send)
    },

    ajaxAlways: function (name, callback, send) {
        this.callbacks[name].ajax.always = callback
        this.ajax.call(this, name, send)
    },

    ajax: function (name, send) {
        // Если вызываем другое событие
        if (send === true) {
            this.ajaxSend(name, AuthModal.Callbacks[this.name][name])
        }
    },

    ajaxSend: function (name, callback) {
        AuthModal.send(AuthModal.sendData.formData, this.callbacks[name], callback)
    },

}

AuthModal.Modal = {
    init: false,
    data: null,
    initialize: function () {

        $(document).on('click', '.auth_modal', function (e) {
            if (e.target) {
                var $content = e.target.closest('.auth_modal-content')
                if (!$content) {
                    AuthModal.Modal.hide()
                }
            }
        })

        $(document).on('click', '.auth_modal-close', function (e) {
            e.preventDefault()

            AuthModal.Modal.hide()
        })

        /**
         * Запускает модеьное окно
         */
        $(document).on('click', '.auth_model-btn', function (e) {
            e.preventDefault()
            AuthModal.Modal.run('phone_code')
        })

        /**
         * Запускает модеьное окно с указаной формой
         */
        $(document).on('click', '.auth_modal_run', function (e) {
            e.preventDefault()
            var forward = $(this).data('form') || 'phone_code'
            AuthModal.Modal.data = $(this).data()
            AuthModal.Modal.run(forward)
        })
    },
    run: function (formId, params) {

        AuthModal.Modal.hide()
        AuthModal.Spinner.show()

        if (!this.init) {
            this.init = true
            this.initialize()
        }

        if (!jQuery().modal) {
            AuthModal.Modal.Lib()
        }
        var formData = {
            form_key: formId
        }
        if (params) {
            Object.keys(params).map(function (field, index) {
                formData[field] = params[field]
            })
        }

        AuthModal.sendData = {
            action: 'auth/modal',
            formData: formData
        }
        AuthModal.controller()

    },
    update: function (response) {

        $('.auth_modal').remove()
        $('.auth_modal-backdrop').remove()

        $('body').append(response.modal)
        AuthModal.Modal.show()
        // Маски для телефонов всегда провешиваются занова
        AuthModal.Mask.initialize()
    },
    show: function () {

        $('body').addClass('auth_modal-open')

        $('#auth_modal').addClass('auth_modal-open')

        $('#auth_modal').addClass('show')

        //$('#auth_modal').modal('show')

        $('body').append($('<div class="auth_modal-backdrop">'))

        AuthModal.ViewPort.update()
    },
    hide: function () {
        $('body').removeClass('auth_modal-open')
        $('#auth_modal').remove()
        $('.auth_modal-backdrop').remove()

        AuthModal.ViewPort.return()
    },
    Lib: function (callback) {
        $.getScript(authModalConfig.jsUrl + 'lib/jquery.modal.js', function () {

        })
    }
}

AuthModal.Modal.initialize()

/**
 * Общие функции
 */
AuthModal.Auth = Object.assign({
    name: 'Auth',
    callbacks: {
        logout: authModalConfig.callbacksObjectTemplate(),
        modal: authModalConfig.callbacksObjectTemplate(),
        changePassword: authModalConfig.callbacksObjectTemplate(),
    },
    /**
     * Выход с сайта
     */
    logout: function () {
        // ответ
        this.ajaxSuccess('logout', function (response) {
            if (response.reload) {
                AuthModal.Forward.reload()
            }
        }, true)
    },
    /**
     * Выход с сайта
     */
    modal: function () {
        // ответ
        this.ajaxSuccess('modal', function (response) {
            AuthModal.Modal.update(response)
        }, true)
    },
    /**
     * Смена пароля
     */
    changePassword: function () {
        // ответ
        this.ajaxSuccess('changePassword', function (response) {

        }, true)
    }
}, AuthModal.Action)

AuthModal.Settings = Object.assign({
    name: 'Settings',
    callbacks: {
        profile: authModalConfig.callbacksObjectTemplate(),
        password: authModalConfig.callbacksObjectTemplate(),
        phone_change: authModalConfig.callbacksObjectTemplate(),
    },
    /**
     * Выход с сайта
     */
    profile: function () {

        // ответ
        /* this.ajaxSuccess('profile', function (response) {
             if (response.reload) {
                 AuthModal.Forward.reload()
             }
         }, true)*/
    },
    /**
     * Выход с сайта
     */
    password: function () {

        /* this.ajaxFail('password', function (response) {

             if (response.responseJSON && response.responseJSON.message) {

                 var $text = $('<div class="auth_error">' + response.responseJSON.message + '</div>')

                 $('#auth_input_change_password .auth_buttons').after($text)
             }
         })*/

        this.ajaxSuccess('password', function (response) {
            if (response.forward) {
                AuthModal.Forward.show(response.forward)
            }
        }, true)

    },
    /**
     * Смена номера телефона
     */
    phone_change: function () {

        this.ajaxFail('phone_change', function (response) {
            if (response.responseJSON && response.responseJSON.timer) {
                AuthModal.Timer.start(response.responseJSON.timer)
            }
        })

        this.ajaxSuccess('phone_change', function (response) {

            AuthModal.Forward.show('phone_confirmation')

            if (response.text) {
                $('#auth_phone_code_text').html(response.text)
            }

            // Запускаем таймер после получения кода
            AuthModal.Timer.start()

        }, true)

    },

}, AuthModal.Action)

AuthModal.Phone = Object.assign({
    name: 'Phone',
    callbacks: {
        code: authModalConfig.callbacksObjectTemplate(),
        confirmation: authModalConfig.callbacksObjectTemplate(),
        check: authModalConfig.callbacksObjectTemplate(),
    },

    /**
     * Отправка кода на телефонный номер
     */
    code: function () {

        if (!AuthModal.Validate.field('phone')) {
            return false
        }

        this.ajaxFail('code', function (response) {

            if (response.responseJSON && response.responseJSON.timer) {
                AuthModal.Timer.start(response.responseJSON.timer)
            }
        })

        // ответ
        this.ajaxSuccess('code', function (response) {

            if (response.reload) {
                AuthModal.Forward.reload()
            }

            AuthModal.Forward.show('phone_confirmation')

            if (response.text) {
                $('#auth_phone_code_text').html(response.text)
            }

            // Запускаем таймер после получения кода
            AuthModal.Timer.start()

        }, true)

    },

    /*
     * Подтверждение код
     */
    confirmation: function () {

        // ответ
        this.ajaxSuccess('confirmation', function (response) {
            if (response.reload) {
                AuthModal.Forward.reload()
            } else if (response.forward) {
                AuthModal.Forward.show(response.forward)
            } else {
                AuthModal.Forward.show('in_login')
            }

        }, true)

    },

    /*
     * Проверка телефона
     */
    check: function () {
        AuthModal.send(AuthModal.sendData.formData, AuthModal.Phone.callbacks.check, AuthModal.Callbacks.Phone.check)
    },

}, AuthModal.Action)

AuthModal.Email = Object.assign({
    name: 'Email',
    callbacks: {
        login: authModalConfig.callbacksObjectTemplate(),
        passwordReset: authModalConfig.callbacksObjectTemplate(),
    },
    /*
    * Вход по Email адресу
    */
    login: function () {

        // ответ
        this.ajaxSuccess('login', function (response) {
            if (response.reload) {
                AuthModal.Forward.reload()
            }
            AuthModal.Forward.show('in_login')
        }, true)

    },

    /**
     * Сброс пароля
     */
    passwordReset: function () {

        // Выполняем запрос и показываем форму с email
        this.ajaxSuccess('passwordReset', function (response) {
            var email = $('input[name=email_reset]').val()
            $('input[name=email]').val(email)
            AuthModal.Forward.show('email_login')

            $('.auth_form')
            AuthModal.Message.success('Пароль успешно отправлен на ваш email адрес.')

        }, true)

    },

}, AuthModal.Action)

/**
 * Управление формой
 * @type {{disable: AuthModal.Form.disable, enable: AuthModal.Form.enable}}
 */
AuthModal.Form = {
    disable: function () {
        AuthModal.Error.clear()

        AuthModal.Spinner.show()

        if (AuthModal.sendData.$form) {
            AuthModal.sendData.$form.addClass('auth_loading')
            var $button = AuthModal.sendData.$form.find('button[type="submit"]')
            $button.prop('disabled', true)
            AuthModal.sendData.$form.find('input').prop('disabled', true)
        }
    },
    enable: function () {

        AuthModal.Spinner.hide()

        if (AuthModal.sendData.$form) {
            AuthModal.sendData.$form.removeClass('auth_loading')
            var $button = AuthModal.sendData.$form.find('button[type="submit"]')
            $button.prop('disabled', false)
            AuthModal.sendData.$form.find('input').prop('disabled', false)
        }
    }
}

AuthModal.send = function (data, callbacks, userCallbacks) {
    var runCallback = function (callback, bind) {
        if (typeof callback == 'function') {
            return callback.apply(bind, Array.prototype.slice.call(arguments, 2))
        } else if (typeof callback == 'object') {
            for (var i in callback) {
                if (callback.hasOwnProperty(i)) {
                    var response = callback[i].apply(bind, Array.prototype.slice.call(arguments, 2))
                    if (response === false) {
                        return false
                    }
                }
            }
        }
        return true
    }

    // set context
    if ($.isArray(data)) {
        data.push({
            name: 'ctx',
            value: authModalConfig.ctx
        })
    } else if ($.isPlainObject(data)) {
        data.ctx = authModalConfig.ctx
    } else if (typeof data == 'string') {
        data += '&ctx=' + authModalConfig.ctx
    }

    // set action url
    var url = '/api/' + AuthModal.sendData.action

    // set request method
    var formMethod = (AuthModal.sendData.$form)
        ? AuthModal.sendData.$form.attr('method')
        : false
    var method = (formMethod)
        ? formMethod
        : 'post'

    AuthModal.Form.disable()
    AuthModal.Message.hide()

    // callback before
    if (runCallback(callbacks.before) === false || runCallback(userCallbacks.before) === false) {
        return
    }
    // send
    var xhr = function (callbacks, userCallbacks) {
        return $[method](url, data, function (response) {
            runCallback(callbacks.response.success, AuthModal, response)
            runCallback(userCallbacks.response.success, AuthModal, response)
        }, 'json').done(function () {
            runCallback(callbacks.ajax.done, AuthModal, xhr)
            runCallback(userCallbacks.ajax.done, AuthModal, xhr)
        }).fail(function (response) {

            if (response.responseJSON) {
                var json = response.responseJSON
                if (json.data) {
                    AuthModal.input.handleErrors(json.data)
                }
            }

            runCallback(callbacks.ajax.fail, AuthModal, xhr)
            runCallback(userCallbacks.ajax.fail, AuthModal, xhr)
        }).always(function () {
            AuthModal.Form.enable()
            runCallback(callbacks.ajax.always, AuthModal, xhr)
            runCallback(userCallbacks.ajax.always, AuthModal, xhr)
        })
    }(callbacks, userCallbacks)
}

/**
 * Запускает отсчет обратного времени в минутах и секундах
 * запускается через AuthModal.Timer.start(4)
 * @type {{countDownDate: null, micro: number, createTime: AuthModal.Timer.createTime, afterTimeOut: AuthModal.Timer.afterTimeOut, inter: null, start: AuthModal.Timer.start, clear: AuthModal.Timer.clear, update: AuthModal.Timer.update, time: number, fun: AuthModal.Timer.fun, resendCode: AuthModal.Timer.resendCode}}
 */
AuthModal.Timer = {
    time: 59,
    micro: 0,
    inter: null,
    start: function (timer) {
        $('.auth_timer_text').show()
        $('.auth_timer_resend').hide()

        this.micro = timer || this.time
        this.createTime(AuthModal.Timer.micro)
        this.clear()
        this.inter = setInterval(' AuthModal.Timer.fun()', 1000)
    },
    clear: function () {
        clearInterval(AuthModal.Timer.inter)
    },
    fun: function () {
        AuthModal.Timer.micro--

        AuthModal.Timer.update()
        if (AuthModal.Timer.micro <= 0) {
            AuthModal.Timer.clear()
            AuthModal.Timer.afterTimeOut()
        }
    },
    update: function () {
        // Get today's date and time
        var now = new Date().getTime()
        // Find the distance between now and the count down date
        var distance = AuthModal.Timer.countDownDate - now
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        var seconds = Math.floor((distance % (1000 * 60)) / 1000)

        if (AuthModal.Timer.micro === 0) {
            minutes = 0
            seconds = 0
        }
        seconds = seconds.toString().padStart(2, '0')
        minutes = minutes.toString().padStart(2, '0')
        var time = minutes + ':' + seconds
        $('.auth_timer').html(time)
    },
    afterTimeOut: function () {
        $('.auth_timer_text').hide()
        $('.auth_timer_resend').show()
    },
    resendCode: function () {
        // Отправляем форму повтроно
        console.log($('#auth_input_phone'))
        $('#auth_input_phone_code').submit()
        $('.auth_input_code').val('')
    },
    countDownDate: null,
    createTime: function (seconds) {
        var today = new Date()
        this.countDownDate = new Date(today.getTime() + (1 * 60 * 60 * 1000))
        this.countDownDate.setSeconds(this.countDownDate.getSeconds() + seconds)
    }
}

AuthModal.Provider = Object.assign({
    name: 'Provider',
    service: '',
    callbacks: {
        interrogate: authModalConfig.callbacksObjectTemplate(),
    },
    init: function () {
        $(document).on('click', '.auth_btn_social', function (e) {
            e.preventDefault()
            $(this).addClass('disabled')
            var url = $(this).attr('href')
            var title = $(this).attr('title')

            AuthModal.Provider.openWindow(url)
            AuthModal.Spinner.show()

            // Запрещаем скрывать сниппет
            AuthModal.Spinner.disableHide = true

            AuthModal.Provider.service = title
            AuthModal.Provider.circle(title)

        })
    },

    // Опрачиваем сервис на авторизацию
    // если авторизация пройдена, то выполняем действия согласно полученым инструкциям
    circle: function () {
        AuthModal.sendData = {
            $form: null,
            action: 'auth/interrogate',
            formData: {
                service: AuthModal.Provider.service
            }
        }
        AuthModal.controller()
    },

    // Опрачиваем сервис на авторизацию
    // если авторизация пройдена, то выполняем действия согласно полученым инструкциям
    interrogate: function () {
        $('.auth_error').remove()

        this.ajaxFail('interrogate', function (response) {
            if (response.status === 302) {
                setTimeout(function () {
                    AuthModal.Provider.circle()
                }, 1000)
            } else {
                AuthModal.Spinner.disableHide = false
                AuthModal.Spinner.hide()
                var $text = $('<div class="auth_error">' + response.responseJSON.message + '</div>')
                $('.auth_error').remove()
                $('#auth_input_phone_code .auth_buttons').after($text)
            }
        })

        // ответ
        this.ajaxSuccess('interrogate', function (response) {

            AuthModal.Spinner.disableHide = false
            AuthModal.Spinner.hide()
            AuthModal.Forward.show('in_login')

        }, true)

    },

    openWindow: function (url) {
        window.open(url, authModalConfig.siteName, 'height=650,width=600')
    },
}, AuthModal.Action)

AuthModal.NotificationInStock = Object.assign({
    name: 'NotificationInStock',
    callbacks: {
        subscribe: authModalConfig.callbacksObjectTemplate(),
    },

    // Опрачиваем сервис на авторизацию
    // если авторизация пройдена, то выполняем действия согласно полученым инструкциям
    subscribe: function () {

        if (AuthModal.Modal.data) {
            Object.keys(AuthModal.Modal.data).map(function (field, index) {
                AuthModal.sendData.formData.push({
                    name: field,
                    value: AuthModal.Modal.data[field],
                })
            })
        }
        $('.auth_error').remove()

        this.ajaxFail('subscribe', function (response) {
            if (response.status !== 200) {
                var $text = $('<div class="auth_error">' + response.responseJSON.message + '</div>')
                $('.auth_error').remove()
                $('#auth_input_notification_in_stock .auth_buttons').after($text)
            } else {
                if (response.responseJSON) {
                    if (response.responseJSON.forward) {
                        AuthModal.Forward.show(response.responseJSON.forward)
                    }
                }
            }

        })

        // ответ
        this.ajaxSuccess('subscribe', function (response) {
            AuthModal.Modal.data = null
            AuthModal.Forward.show('notification_in_stock_success')
        }, true)

    },

}, AuthModal.Action)

AuthModal.ViewPort = {
    change: false,
    current: null,
    param: 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no',
    update: function () {
        if (!AuthModal.ViewPort.change) {
            AuthModal.ViewPort.change = true
            var viewport = this.get()

            if (viewport && !AuthModal.ViewPort.current) {
                // Записивыем эксзепляр
                AuthModal.ViewPort.current = viewport
            }

            this.get().remove()
            this.addHead(this.create())

        }
    },
    get: function () {
        return $('meta[name=viewport]')
    },
    return: function () {
        if (AuthModal.ViewPort.change) {
            AuthModal.ViewPort.change = false
            this.get().remove()
            if (AuthModal.ViewPort.current) {
                this.addHead(AuthModal.ViewPort.current)
            } else {
                this.get().remove()
            }
        }
    },
    create: function () {
        return $('<meta name="viewport" content="' + AuthModal.ViewPort.param + '">')
    },
    addHead: function (viewport) {
        $('head').append(viewport)
    }
}

AuthModal.Validate = {
    field: function (field) {
        var error = false
        switch (field) {
            case 'phone':
                if (!AuthModal.input.validate()) {
                    error = 'Номер телефона указан не верно'
                }
                break
            case 'email':
                if (!AuthModal.input.validate()) {
                    error = 'Номер телефона указан не верно'
                }
                break
            default:
                break
        }
        if (error !== false) {
            AuthModal.Error.add(field, error)
            return false
        } else {
            AuthModal.Error.clear()
            return true
        }
    },
}

AuthModal.input = {
    value: null,
    auth_code: null,
    country_code: authModalConfig.country_code,
    init: function () {

        // Проверяем заполняемость полей
        $('.auth_input_no_mask').each(
            function (index, element) {
                var val = $(this).val()
                if (val !== '') {
                    $(this).closest('.auth_block_inputs_phone_outer_row').find('.auth_input_placeholder').addClass('auth_input_placeholder_focus')
                }
            }
        )

    },
    set: function (val) {
        val = this.parse(val)
        if (isNaN(val) || val === undefined) {
            val = null
        }

        this.value = val
        this.placeholderToggle()

        $('input[name="auth_phone"]').val(this.get())

        var format = this.get() || ''

        if (format) {
            $('#auth_phone').text(format)
        }

    },
    setValue: function (val) {
        this.set(val)
        // Запись телефона в маску
        var selector = document.querySelector('.auth_input')
        if (selector) {
            selector.inputmask.setValue(this.get(false))
        }
    },
    is: function () {
        if (this.value) {
            return true
        }
        return false
    },
    setAuthCode: function () {

        var code = $(this).val()
        code = code.replace(/[^0-9]/g, '')

        if (code.length !== 4) {
            return false
        }

        if (AuthModal.input.auth_code === code) {
            return true
        }

        AuthModal.input.auth_code = code

        $('input[name=auth_code]').val(code)

        $('#auth_input_code').submit()

    },
    get: function (addSelect) {
        var value = this.value
        if (!value) {
            return value
        }
        return addSelect !== false ? AuthModal.input.country_code + value : value
    },
    validate: function () {
        var val = this.get()
        if (!val) {
            return false
        }
        if (val.length !== 11) {
            return false
        }
        return true
    },
    parse: function (value) {
        if (!value) {
            return value
        }

        value = value.replace(/[^0-9]/g, '')
        value = parseInt(value)
        if (isNaN(value) || value === undefined) {
            return null
        }
        value = value.toString()
        if (value.length === 11) {
            if (value[0] === '8' || value[0] === AuthModal.input.country_code) {
                value = value.slice(1)
            }
        }
        return value
    },
    placeholderToggle: function () {
        if (this.is()) {
            this.placeholderHide()
        } else {
            this.placeholderShow()
        }
    },
    placeholderHide: function () {
        $('.auth_input_placeholder_toggle').hide()
    },
    placeholderShow: function () {
        $('.auth_input_placeholder_toggle').show()
    },
    handleErrors: function (data) {

        for (var field in data) {
            if (data.hasOwnProperty(field)) {
                var text = data[field]
                AuthModal.Error.add(field, text)
            }
        }

    }
}

AuthModal.Mask = {
    initialize: function () {

        // Наложение макси для телефона
        AuthModal.Mask.impose('.auth_input', {
            mask: '999 999 9999',
            placeholder: '_',
            showMaskOnHover: false,
            showMaskOnFocus: false,
            onBeforePaste: function (pastedValue, opts) {
                AuthModal.input.set(pastedValue)
                return AuthModal.input.get(false)
            },
            onBeforeMask: function (value, opts) {
                AuthModal.input.set(value)
                return AuthModal.input.get(false)
            }
        }, function () {
            $('.auth_input').addClass('auth_mask_init')
        })

        // Наложение макси для кода
        AuthModal.Mask.impose('.auth_input_code', {
            placeholder: '_',
            mask: '9 9 9 9',
            clearMaskOnLostFocus: false
        }, function () {
            $('.auth_input_code').addClass('auth_mask_init')
        })

    },
    destroy: function (selector, callback) {
        // Разработать уничтожение маски при смене кода страны
    },
    impose: function (selector, options, callback) {
        console.log(selector)
        if (typeof (jQuery().inputmask) == 'undefined') {
            this.lib(selector, options, callback)
        } else {
            this.handle(selector, options, callback)
        }
    },
    handle: function (selector, options, callback) {
        options = Object.assign({}, options)
        $(selector).inputmask(options)
        if (typeof callback === 'function') {
            callback()
        }
    },
    lib: function (selector, options, callback) {

        $.getScript(authModalConfig.jsUrl + 'lib/jquery.inputmask.min.js', function () {
            AuthModal.Mask.handle(selector, options, callback)
        })
    }
}

/**
 * Общие функции
 */
AuthModal.Spinner = {
    selector: '.auth_spinners',
    disableHide: false,
    get: function () {
        return $(this.selector)
    },
    has: function () {
        return this.get().length > 0
    },
    hide: function () {
        if (!this.disableHide) {
            this.get().removeClass('auth_loading')
        }
    },
    show: function () {
        if (!this.has()) {
            this.reg()
        }
        this.get().addClass('auth_loading')
    },
    reg: function () {
        var main = $('<div class="auth_spinners"><div class="auth_spinners_content"><div class="auth_spinner"></div><div class="auth_spinner"></div><div class="auth_spinner"></div><div class="auth_spinner"></div></div></div>')
        $('body').append(main)
    }
}

/**
 * Контроль ошибок
 * @type {{add: AuthModal.Error.add, clear: AuthModal.Error.clear, animated: AuthModal.Error.animated}}
 */
AuthModal.Error = {
    add: function (field, error) {

        var $field = $('input[name=' + field + ']')
        var $inputs = $field.closest('.auth_block_inputs_phone')

        $inputs.find('.auth_block_error').remove()

        var $outer = $field.closest('.auth_block_inputs_phone_outer')
        $outer.addClass('auth_error')

        var $error = $('<div class="auth_block_error">')
        var $p = $('<p class="auth_error">').html(error)
        $error.append($p)

        $inputs.append($error)
        AuthModal.Error.animated.call($outer)
    },
    clear: function () {
        $('.auth_block_inputs_phone_outer').removeClass('auth_error')
        $('.auth_block_error').remove()
    },
    animated: function () {
        $(this).addClass('shake')
        setTimeout(function () {
            $('.shake').removeClass('shake')
        }, 300)
    }
}

/**
 * Переключение форма
 * @type {{reload: AuthModal.Forward.reload, forward: ((function(): (boolean|undefined))|*), show: AuthModal.Forward.show}}
 */
AuthModal.Forward = {
    formId: null,
    show: function (formId, copy) {
        this.formId = formId

        AuthModal.Message.hide()

        AuthModal.Error.clear()

        $('#auth_modal .auth_form').hide()

        // Переключение на форму
        var $form = $('[data-form-id="' + formId + '"]')

        if ($form.length === 0) {
            console.error('form not found ' + formId)
            return false
        }

        $('.auth_form_active').removeClass('auth_form_active')

        $form.show()
        $form.addClass('auth_form_active')

        var $inputFocus = $form.find('input[autofocus]')
        if ($inputFocus.length > 0) {
            $inputFocus.focus()

            if (copy) {
                var $Copy = $('input[name="' + copy + '"]')
                if ($Copy.length > 0) {
                    // Копируем значение из поля и вставляем его в форму
                    $inputFocus.val($Copy.val())
                }
            }
        }

    },
    toggle: function () {

        var copy = $(this).data('copy')

        AuthModal.Forward.show($(this).data('form'), copy)
    },

    reload: function () {
        // Перезагружаем страницу после авторизации

        if (this.reload_cancel_one) {
            this.reload_cancel_one = false
        } else {
            window.location.reload()
        }
    },

    reload_cancel_one: false,
    reloadCancelOne: function () {
        // Отменить один раз перезагрузку страницы
        this.reload_cancel_one = true
    }
}

AuthModal.Placeholder = {

    init: function () {

        /**
         * При фокусе в форму убираем поднимаем плейсхолдер
         */

        $(document).on('focus', '.auth input', function () {
            $(this).closest('.auth_block_inputs_phone_outer').addClass('auth_focus')
        })

        /**
         * При выходе из фокуса
         */

        $(document).on('blur', '.auth input', function () {
            var val = $(this).val()

            if (val === '') {
                $('.auth_block_inputs_phone_outer').removeClass('auth_focus')
            }
        })


        /**
         * Ввод данные в форму
         */
        $(document).on('keyup', '.auth input', function () {
            var $placeholder = $(this).closest('.auth_block_inputs_phone_outer_row').find('.auth_input_placeholder')
            var val = $(this).val()
            if (val !== '') {
                $placeholder.addClass('auth_input_placeholder_focus')
            } else {
                $placeholder.removeClass('auth_input_placeholder_focus')
            }
        })
    }
}

/**
 * Подтверждение номера телефона на странице оформления заказа
 * - на input накладывается маска
 * - если номер телефона найден в базе то предлагаем пользователю пройти авторизацияю
 */
AuthModal.orderPhoneConfirmation = {
    run: function () {

        $(document).on('click', '.auth_confirm_phone', function (e) {
            e.preventDefault()

            AuthModal.Forward.reloadCancelOne()
            AuthModal.Modal.run('phone_code', {
                phone: AuthModal.input.get(),
            })

        })

        if ($('#msOrder').length > 0) {

            // Наложение макси для телефона
            AuthModal.Mask.impose('#msOrder input[name=phone]', {
                mask: '999 999 9999',
                placeholder: '_',
                showMaskOnHover: false,
                showMaskOnFocus: false,
                onBeforePaste: function (pastedValue, opts) {
                    console.log(pastedValue)
                    AuthModal.input.set(pastedValue)
                    return AuthModal.input.get(false)
                },
                onBeforeMask: function (value, opts) {
                    AuthModal.input.set(value)
                    return AuthModal.input.get(false)
                }
            }, function () {

                var phone = AuthModal.input.get()
                if (phone) {
                    AuthModal.sendData = {
                        action: 'auth/phone/check',
                        formData: {
                            phone: phone
                        }
                    }

                    // Если нормер подтвержден, предлагаем пользовалю подтвердить номер телефона
                    AuthModal.Callbacks.add('Phone.check.response.success', 'check_phone', function (response) {
                        if (response.numberExists) {

                            AuthModal.orderPhoneConfirmation.confirmMessage()
                            /* AuthModal.Modal.run('phone_code', {
                                 phone: phone
                             })*/
                        }
                    })

                    // Отправляем код на номер телефона после того как загрузилось модельное окно
                    AuthModal.Callbacks.add('Auth.modal.response.success', 'send_code_phone', function (response) {
                        $('#auth_input_phone_code').submit()
                    })

                    AuthModal.controller()
                }

            })
        }
    },
    confirmMessage: function () {

        var $link = $('<small><a href="#" class="auth_confirm_phone">войти на сайт</a></small>')

        $('#msOrder input[name=phone]').after($link)
    }
}

/*
$(document).ready(function ($) {
    AuthModal.initialize()
})
*/

 window.AuthModal = AuthModal;
 })(window, document, jQuery, authModalConfig)