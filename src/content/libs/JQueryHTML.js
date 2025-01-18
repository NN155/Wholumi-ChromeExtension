function openCardGiftModal(cardImage, cardName, cardRank) {
    var rankLabel = '';
    if (cardRank == 's') rankLabel = 'Мифическая';
    else if (cardRank == 'a') rankLabel = 'Легендарная';
    else if (cardRank == 'b') rankLabel = 'Эпическая';
    else if (cardRank == 'c') rankLabel = 'Редкая';
    else if (cardRank == 'd') rankLabel = 'Необычная';
    else if (cardRank == 'e') rankLabel = 'Обычная';
    else if (cardRank == 'ss') rankLabel = 'Небесная';
    else if (cardRank == 'sss') rankLabel = 'Божественная';

    var modalContent = '<div class="unique-modal" id="unique-modal-gift-card" tabindex="-1">';
    modalContent += '<div class="anime-modal__inner">';
    modalContent += '<div class="anime-modal__content">';
    modalContent += '<div class="anime-modal__body">';
    modalContent += '<div class="anime-cards__container">';
    modalContent += '<div class="anime-cards__header" style="background-image: url(' + cardImage + ');"></div>';
    modalContent += '<div class="anime-cards__wrapper">';
    modalContent += '<div class="anime-cards__placeholder">';
    modalContent += '<img src="' + cardImage + '" alt="Карточка">';
    modalContent += '</div>';
    modalContent += '<div class="anime-cards__info">';
    modalContent += '<div class="anime-cards__rank rank-' + cardRank + '">' + rankLabel + '</div>';
    modalContent += '<div class="anime-cards__name">Твоя уникальная находка!</div>';
    modalContent += '<div class="anime-cards__text">Поздравляем! Ты открыл карточку с ' + cardName + '. Карточка добавлена в твою коллекцию.</div>';
    modalContent += '</div>';
    modalContent += '</div>';
    modalContent += '</div>';
    modalContent += '</div>';
    modalContent += '</div>';
    modalContent += '</div>';
    modalContent += '</div>';

    var shadow = 'none';
    $('#unique-card-modal').remove();
    $('body').prepend("<div id='unique-card-modal' title='Информация о карточке' class='ui-dialog-content ui-widget-content' style='display:none'></div>");
    var windowHeight = 560;
    var windowWidth = 500;
    if (windowWidth > 1024) { windowWidth = 1024; }
    $('#unique-card-modal').dialog({
        autoOpen: true,
        width: windowWidth,
        height: windowHeight,
        resizable: false,
        dialogClass: "unique-modal-fixed",
        position: {
            my: "center",
            at: "center",
            of: window,
            collision: "fit",
        },
        dragStart: function (event, ui) {
            shadow = $(".unique-modal-fixed").css('box-shadow');
            $(".unique-modal-fixed").css('box-shadow', 'none');
        },
        dragStop: function (event, ui) {
            $(".unique-modal-fixed").css('box-shadow', shadow);
        },
        close: function (event, ui) {
            $(this).dialog('destroy');
            $('#modal-overlay').fadeOut(function () {
                $('#modal-overlay').remove();
            });
            $(window).off('resize.uniqueModal');
            $(document).off('mouseup.uniqueModal');
        }
    });

    if ($(window).width() > 830 && $(window).height() > 530) {
        $('.unique-modal-fixed.ui-dialog').css({ position: "fixed" });
        $('#unique-card-modal').dialog("option", "position", { my: "center", at: "center", of: window });
    }

    $('#unique-card-modal').css({ overflow: "auto" });
    $('#unique-card-modal').css({ 'overflow-x': "hidden" });

    $("#unique-card-modal").html(modalContent);

    // Додавання слухача для mouseUp поза модалкою
    $(document).on('mouseup.uniqueModal', function (event) {
        var $modal = $('#unique-card-modal');
        if (!$modal.is(event.target) && $modal.has(event.target).length === 0) {
            // Якщо клік за межами модального вікна
            $('#unique-card-modal').dialog('close');
        }
    });
    $(window).on('resize.uniqueModal', function () {
        $('#unique-card-modal').dialog("option", "position", { my: "center", at: "center", of: window });
    });
}



function processLootboxData(data) {
    if (data.error) {
        DLEPush.warning(data.error, '');
        $('.lootbox__open-btn').prop('disabled', false);
        $('.lootbox__open-btn').show();
        return false;
    }

    var cards_arr = data.cards;
    cards_arr.forEach(function (item, index) {
        var $card = $('.lootbox__card-disabled').eq(index);
        $card.attr('data-id', item.id);
        $card.attr('data-rank', item.rank);
        $card.find('img').attr('src', item.src);
        if (item.owned == 1) {
            $card.addClass("anime-cards__item-disabled anime-cards__owned-by-user");
        } else {
            if ($card.hasClass("anime-cards__owned-by-user")) {
                $card.removeClass("anime-cards__item-disabled anime-cards__owned-by-user");
            }
        }
    });

    $('.lootbox__row').attr('data-pack-id', data.cards.id).show();

}