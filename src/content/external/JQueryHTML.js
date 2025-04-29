function openCardGiftModal({image, name, rank, card_webm, card_mp4}) {
    var rankname = '';
    if ( rank == 's' ) rankname = 'мифическая';
    else if ( rank == 'a' ) rankname = 'легендарная';
    else if ( rank == 'b' ) rankname = 'эпическая';
    else if ( rank == 'c' ) rankname = 'редкая';
    else if ( rank == 'd' ) rankname = 'необычная';
    else if ( rank == 'e' ) rankname = 'обычная';
    else if ( rank == 'ass' ) rankname = 'космическая';
    
    var modalContent = '<div class="modal modal--open" id="modal-cards" tabindex="-1">';
    modalContent += '<div class="modal__inner">';
    modalContent += '<div class="modal__content">';
    modalContent += '<div class="modal__body">';
    modalContent += '<div class="anime-cards__container">';
    if (card_webm && card_mp4) modalContent += '<div class="anime-cards__header anime-cards__header--modal-video"><video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_webm + '" type="video/webm"><source src="' + card_mp4 + '" type="video/mp4"></video></div>';
    else if (card_mp4) modalContent += '<div class="anime-cards__header anime-cards__header--modal-video"><video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_mp4 + '" type="video/mp4"></video></div>';
    else if (card_webm) modalContent += '<div class="anime-cards__header anime-cards__header--modal-video"><video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_webm + '" type="video/webm"></video></div>';
    else modalContent += '<div class="anime-cards__header" style="background-image: url(' + image + ');"></div>';
    modalContent += '<div class="anime-cards__wrapper">';
    if (card_webm && card_mp4) modalContent += '<video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_webm + '" type="video/webm"><source src="' + card_mp4 + '" type="video/mp4"></video>';
    else if (card_mp4) modalContent += '<video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_mp4 + '" type="video/mp4"></video>';
    else if (card_webm) modalContent += '<video poster="' + image + '" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true"><source src="' + card_webm + '" type="video/webm"></video>';
    else modalContent += '<div class="anime-cards__placeholder"><img src="' + image + '" alt="Карточка"></div>';
    modalContent += '<div class="anime-cards__info">';
    modalContent += '<div class="anime-cards__rank rank-' + rank + '">' + rankname + '</div>';
    modalContent += '<div class="anime-cards__name">Твоя уникальная находка!</div>';
    modalContent += '<div class="anime-cards__text">Поздравляем! Ты открыл карточку с ' + name + '. Карточка добавлена в твою коллекцию.</div>';
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

    $(document).on('mouseup.uniqueModal', function (event) {
        var $modal = $('#unique-card-modal');
        if (!$modal.is(event.target) && $modal.has(event.target).length === 0) {
            $('#unique-card-modal').dialog('close');
        }
    });
    $(window).on('resize.uniqueModal', function () {
        $('#unique-card-modal').dialog("option", "position", { my: "center", at: "center", of: window });
    });
}

function processLootboxData(data) {
    var cards_arr = data.cards;
    cards_arr.forEach(function (item, index) {
        var $card = $('.lootbox__card-disabled').eq(index);
        $card.attr('data-id', item.id);
        $card.attr('data-rank', item.rank);
        
        if ( item.video_mp4 || item.video_webm ) $card.html('<video poster="'+item.image+'" pip="false" webkit-playsinline="true" playsinline="true" autoplay="true" muted="muted" loop="true" style="border-radius: 12px;">'+
                '<source src="'+item.video_webm+'" type="video/webm">'+
                '<source src="'+item.video_mp4+'" type="video/mp4">'+
            '</video>');
        else $card.html('<img src="'+item.image+'" alt="Карточка">');
        if ( item.owned == 1 ) $card.addClass( "anime-cards__item-disabled anime-cards__owned-by-user" );
        else {
            if ( $card.hasClass( "anime-cards__owned-by-user" ) ) $card.removeClass( "anime-cards__item-disabled anime-cards__owned-by-user" );
        }
     });

    $('.lootbox__row').attr('data-pack-id', data.cards.id).show();
}