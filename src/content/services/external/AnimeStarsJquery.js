/*! jQuery UI - v1.13.2 - 2023-11-19
* http://jqueryui.com
* Includes: widget.js, position.js, data.js, disable-selection.js, focusable.js, form-reset-mixin.js, jquery-patch.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/draggable.js, widgets/resizable.js, widgets/autocomplete.js, widgets/button.js, widgets/checkboxradio.js, widgets/controlgroup.js, widgets/dialog.js, widgets/menu.js, widgets/mouse.js, widgets/progressbar.js, effect.js, effects/effect-blind.js, effects/effect-fade.js, effects/effect-highlight.js, effects/effect-pulsate.js, effects/effect-size.js, effects/effect-slide.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

!function(n) {
    "function" == typeof define && define.amd ? define(["jquery"], n) : "object" == typeof module && module.exports ? module.exports = function(e, t) {
        return void 0 === t && (t = "undefined" != typeof window ? require("jquery") : require("jquery")(e)),
        n(t),
        t
    }
    : n(jQuery)
}(function(a) {
    a.jGrowl = function(e, t) {
        0 === a("#DLEPush").length && a('<div id="DLEPush" class="DLEPush"></div>').addClass((t && t.position ? t : a.jGrowl.defaults).position).appendTo((t && t.appendTo ? t : a.jGrowl.defaults).appendTo),
        a("#DLEPush").jGrowl(e, t)
    }
    ,
    a.fn.jGrowl = function(e, t) {
        if (void 0 === t && a.isPlainObject(e) && (e = (t = e).message),
        a.isFunction(this.each)) {
            var n = arguments;
            return this.each(function() {
                void 0 === a(this).data("jGrowl.instance") && (a(this).data("jGrowl.instance", a.extend(new a.fn.jGrowl, {
                    notifications: [],
                    element: null,
                    interval: null
                })),
                a(this).data("jGrowl.instance").startup(this)),
                a.isFunction(a(this).data("jGrowl.instance")[e]) ? a(this).data("jGrowl.instance")[e].apply(a(this).data("jGrowl.instance"), a.makeArray(n).slice(1)) : a(this).data("jGrowl.instance").create(e, t)
            })
        }
    }
    ,
    a.extend(a.fn.jGrowl.prototype, {
        defaults: {
            pool: 0,
            header: "",
            icon: "",
            group: "",
            sticky: !1,
            position: "top-right",
            appendTo: "body",
            glue: "after",
            theme: "",
            check: 250,
            life: 3e3,
            closeDuration: "normal",
            openDuration: "normal",
            easing: "swing",
            closer: !0,
            closeTemplate: "&times;",
            log: function() {},
            beforeOpen: function() {},
            afterOpen: function() {},
            open: function() {},
            beforeClose: function() {},
            close: function() {},
            click: function() {},
            animateOpen: {
                opacity: "show"
            },
            animateClose: {
                opacity: "hide"
            }
        },
        notifications: [],
        element: null,
        interval: null,
        create: function(e, t) {
            t = a.extend({}, this.defaults, t);
            void 0 !== t.speed && (t.openDuration = t.speed,
            t.closeDuration = t.speed),
            this.notifications.push({
                message: e,
                options: t
            }),
            t.log.apply(this.element, [this.element, e, t])
        },
        render: function(e) {
            var t = this
              , n = e.message
              , i = e.options
              , o = a("<div/>").addClass("DLEPush-notification wrapper" + (void 0 !== i.group && "" !== i.group ? " " + i.group : "")).append(a("<button/>").addClass("DLEPush-close").html(i.closeTemplate)).append(a("<div/>").addClass("DLEPush-icon").html(i.icon)).append(a("<div/>").addClass("DLEPush-header").html(i.header)).append(a("<div/>").addClass("DLEPush-message").html(n)).data("jGrowl", i).addClass(i.theme).children(".DLEPush-close").bind("click.jGrowl", function() {
                return a(this).parent().trigger("jGrowl.beforeClose"),
                !1
            }).parent();
            a(o).bind("mouseover.jGrowl", function() {
                a(".DLEPush-notification", t.element).data("jGrowl.pause", !0)
            }).bind("mouseout.jGrowl", function() {
                a(".DLEPush-notification", t.element).data("jGrowl.pause", !1)
            }).bind("jGrowl.beforeOpen", function() {
                !1 !== i.beforeOpen.apply(o, [o, n, i, t.element]) && a(this).trigger("jGrowl.open")
            }).bind("jGrowl.open", function() {
                !1 !== i.open.apply(o, [o, n, i, t.element]) && ("after" == i.glue ? a(".DLEPush-notification:last", t.element).after(o) : a(".DLEPush-notification:first", t.element).before(o),
                a(this).animate(i.animateOpen, i.openDuration, i.easing, function() {
                    !1 === a.support.opacity && this.style.removeAttribute("filter"),
                    null !== a(this).data("jGrowl") && void 0 !== a(this).data("jGrowl") && (a(this).data("jGrowl").created = new Date),
                    a(this).trigger("jGrowl.afterOpen")
                }))
            }).bind("jGrowl.afterOpen", function() {
                i.afterOpen.apply(o, [o, n, i, t.element])
            }).bind("click", function() {
                i.click.apply(o, [o, n, i, t.element])
            }).bind("jGrowl.beforeClose", function() {
                !1 !== i.beforeClose.apply(o, [o, n, i, t.element]) && a(this).trigger("jGrowl.close")
            }).bind("jGrowl.close", function() {
                a(this).data("jGrowl.pause", !0),
                a(this).animate(i.animateClose, i.closeDuration, i.easing, function() {
                    (!a.isFunction(i.close) || !1 !== i.close.apply(o, [o, n, i, t.element])) && a(this).remove()
                })
            }).trigger("jGrowl.beforeOpen")
        },
        update: function() {
            a(this.element).find(".DLEPush-notification:parent").each(function() {
                void 0 !== a(this).data("jGrowl") && void 0 !== a(this).data("jGrowl").created && a(this).data("jGrowl").created.getTime() + parseInt(a(this).data("jGrowl").life, 10) < (new Date).getTime() && !0 !== a(this).data("jGrowl").sticky && (void 0 === a(this).data("jGrowl.pause") || !0 !== a(this).data("jGrowl.pause")) && a(this).trigger("jGrowl.beforeClose")
            }),
            0 < this.notifications.length && (0 === this.defaults.pool || a(this.element).find(".DLEPush-notification:parent").length < this.defaults.pool) && this.render(this.notifications.shift()),
            a(this.element).find(".DLEPush-notification:parent").length < 2 && a(this.element).find(".DLEPush-closer").animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
                a(this).remove()
            })
        },
        startup: function(e) {
            this.element = a(e).addClass("jGrowl").append('<div class="DLEPush-notification"></div>'),
            this.interval = setInterval(function() {
                var t = a(e).data("jGrowl.instance");
                if (void 0 !== t)
                    try {
                        t.update()
                    } catch (e) {
                        throw t.shutdown(),
                        e
                    }
            }, parseInt(this.defaults.check, 10))
        },
        shutdown: function() {
            try {
                a(this.element).removeClass("jGrowl").find(".DLEPush-notification").trigger("jGrowl.close").parent().empty()
            } catch (e) {
                throw e
            } finally {
                clearInterval(this.interval)
            }
        },
        close: function() {
            a(this.element).find(".DLEPush-notification").each(function() {
                a(this).trigger("jGrowl.beforeClose")
            })
        }
    }),
    a.jGrowl.defaults = a.fn.jGrowl.prototype.defaults
});

function DLEPush() {}

DLEPush.info = function(message, title, life) {

    return $.jGrowl(message, {
        header: title ? title : '',
        theme: 'push-success',
        icon: '<svg width="16" height="28" fill="currentColor" viewBox="0 0 16 28"><path d="M11.5 9c0 0.266-0.234 0.5-0.5 0.5s-0.5-0.234-0.5-0.5c0-1.078-1.672-1.5-2.5-1.5-0.266 0-0.5-0.234-0.5-0.5s0.234-0.5 0.5-0.5c1.453 0 3.5 0.766 3.5 2.5zM14 9c0-3.125-3.172-5-6-5s-6 1.875-6 5c0 1 0.406 2.047 1.062 2.812 0.297 0.344 0.641 0.672 0.953 1.031 1.109 1.328 2.047 2.891 2.203 4.656h3.563c0.156-1.766 1.094-3.328 2.203-4.656 0.313-0.359 0.656-0.688 0.953-1.031 0.656-0.766 1.062-1.813 1.062-2.812zM16 9c0 1.609-0.531 3-1.609 4.188s-2.5 2.859-2.625 4.531c0.453 0.266 0.734 0.766 0.734 1.281 0 0.375-0.141 0.734-0.391 1 0.25 0.266 0.391 0.625 0.391 1 0 0.516-0.266 0.984-0.703 1.266 0.125 0.219 0.203 0.484 0.203 0.734 0 1.016-0.797 1.5-1.703 1.5-0.406 0.906-1.313 1.5-2.297 1.5s-1.891-0.594-2.297-1.5c-0.906 0-1.703-0.484-1.703-1.5 0-0.25 0.078-0.516 0.203-0.734-0.438-0.281-0.703-0.75-0.703-1.266 0-0.375 0.141-0.734 0.391-1-0.25-0.266-0.391-0.625-0.391-1 0-0.516 0.281-1.016 0.734-1.281-0.125-1.672-1.547-3.344-2.625-4.531s-1.609-2.578-1.609-4.188c0-4.25 4.047-7 8-7s8 2.75 8 7z"></path></svg>',
        life: life ? life : 4000
    });

}
;

DLEPush.warning = function(message, title, life) {

    return $.jGrowl(message, {
        header: title ? title : '',
        theme: 'push-warning',
        icon: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 28 28"><path d="M16 21.484v-2.969c0-0.281-0.219-0.516-0.5-0.516h-3c-0.281 0-0.5 0.234-0.5 0.516v2.969c0 0.281 0.219 0.516 0.5 0.516h3c0.281 0 0.5-0.234 0.5-0.516zM15.969 15.641l0.281-7.172c0-0.094-0.047-0.219-0.156-0.297-0.094-0.078-0.234-0.172-0.375-0.172h-3.437c-0.141 0-0.281 0.094-0.375 0.172-0.109 0.078-0.156 0.234-0.156 0.328l0.266 7.141c0 0.203 0.234 0.359 0.531 0.359h2.891c0.281 0 0.516-0.156 0.531-0.359zM15.75 1.047l12 22c0.344 0.609 0.328 1.359-0.031 1.969s-1.016 0.984-1.719 0.984h-24c-0.703 0-1.359-0.375-1.719-0.984s-0.375-1.359-0.031-1.969l12-22c0.344-0.641 1.016-1.047 1.75-1.047s1.406 0.406 1.75 1.047z"></path></svg>',
        life: life ? life : 6000
    });

}
;

DLEPush.error = function(message, title, life) {

    return $.jGrowl(message, {
        header: title ? title : '',
        theme: 'push-error',
        icon: '<svg width="24" height="28" fill="currentColor" viewBox="0 0 24 28"><path d="M20.5 13.953c0-1.703-0.5-3.281-1.359-4.609l-11.781 11.766c1.344 0.875 2.938 1.391 4.641 1.391 4.688 0 8.5-3.828 8.5-8.547zM4.891 18.625l11.797-11.781c-1.344-0.906-2.953-1.422-4.688-1.422-4.688 0-8.5 3.828-8.5 8.531 0 1.734 0.516 3.328 1.391 4.672zM24 13.953c0 6.656-5.375 12.047-12 12.047s-12-5.391-12-12.047c0-6.641 5.375-12.031 12-12.031s12 5.391 12 12.031z"></path></svg>',
        life: life ? life : 8000
    });

}