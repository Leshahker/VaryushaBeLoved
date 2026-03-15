$(document).ready(function() {
    const pages = $('.page');
    const totalPages = pages.length; // Теперь ровно 14 страниц (7 разворотов)
    let currentPage = 0;

    // 1. Появление книги по клику (Фон не пропадает!)
    $('#intro-overlay').on('click', function() {
        $(this).fadeOut(800);
        // Показываем контейнер с книгой плавно
        $('#book-container').css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, 1000);
        setupBook();
    });

    // 2. Логика 3D перелистывания
    function setupBook() {
        updateButtons();
        updatePages();
    }

    $('#next-page-btn').on('click', function() {
        if (currentPage < totalPages - 2) {
            currentPage += 2;
            updatePages();
            updateButtons();
        } else {
            closeBookAndEnd();
        }
    });

    $('#prev-page-btn').on('click', function() {
        if (currentPage > 0) {
            currentPage -= 2;
            updatePages();
            updateButtons();
        }
    });

    function updatePages() {
        pages.each(function(index) {
            const page = $(this);
            // Четные индексы (0, 2, 4...) — это левые страницы. Нечетные (1, 3, 5...) — правые.
            const isLeftPage = index % 2 === 0;

            if (index < currentPage) {
                // Перевернуты и лежат слева
                page.css('transform', isLeftPage ? 'rotateY(0deg)' : 'rotateY(-180deg)');
                page.css('z-index', index);
            } else if (index === currentPage || index === currentPage + 1) {
                // Открытый сейчас разворот
                page.css('transform', 'rotateY(0deg)');
                page.css('z-index', totalPages + 10);
            } else {
                // Ждут своей очереди справа
                page.css('transform', isLeftPage ? 'rotateY(180deg)' : 'rotateY(0deg)');
                page.css('z-index', totalPages - index);
            }
        });

        // Запуск пазла (он находится на развороте с индексом 10)
        if (currentPage === 2) {
            if (!$('#puzzle-container').hasClass('completed')) {
                initializePuzzle();
            }
        }
    }
    
    function updateButtons() {
        if (currentPage === 0) {
            $('#prev-page-btn').addClass('hidden');
        } else {
            $('#prev-page-btn').removeClass('hidden');
        }
        
        // Меняем текст кнопки на последнем развороте
        if (currentPage >= totalPages - 2) {
            $('#next-page-btn').text('Закрыть ✖');
        } else {
            $('#next-page-btn').text('›');
        }
    }

    // 3. Логика Пазла
    function initializePuzzle() {
        const container = $('#puzzle-container');
        if (container.children().length > 0) return;

        const pieces = [];
        for (let i = 0; i < 9; i++) {
            const piece = $('<div></div>').addClass('puzzle-piece');
            const row = Math.floor(i / 3);
            const col = i % 3;
            
            piece.css({
                'background-image': 'url("photo_2026-02-07_07-51-18.jpg")', /* <-- Вставь название своего фото */
                'background-size': '300px 300px', /* <-- Обязательно размер 300x300, т.к. у тебя 9 кусков по 100px */
                'background-position': `-${col * 100}px -${row * 100}px`
            });
            piece.data('correct-pos', { top: row * 100, left: col * 100 });
            
            // Если фото нет, добавляем циферки чтобы можно было собрать
            piece.html(`<span style="opacity: 0.3">${i + 1}</span>`);
            pieces.push(piece);
        }

        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(piece => {
            const randomTop = Math.random() * 150 - 25; 
            const randomLeft = Math.random() * (container.width() + 50) - 25; 
            piece.css({ top: randomTop + 'px', left: randomLeft + 'px' });
            container.append(piece);
        });

        $('.puzzle-piece').draggable({
            containment: 'document',
            revert: 'invalid',
            start: function() { $(this).css('z-index', 101); },
            stop: function() { $(this).css('z-index', 100); }
        });

        container.droppable({
            drop: function(event, ui) {
                const piece = $(ui.draggable);
                const correctPos = piece.data('correct-pos');
                const containerOffset = container.offset();
                const pieceOffset = piece.offset();
                
                const relativePos = {
                    top: pieceOffset.top - containerOffset.top,
                    left: pieceOffset.left - containerOffset.left,
                };

                const snapTop = Math.round(relativePos.top / 100) * 100;
                const snapLeft = Math.round(relativePos.left / 100) * 100;
                
                piece.css({ top: snapTop + 'px', left: snapLeft + 'px' });
                checkPuzzleCompletion();
            }
        });
    }

    function checkPuzzleCompletion() {
        let correctPieces = 0;
        $('.puzzle-piece').each(function() {
            const piece = $(this);
            const correctPos = piece.data('correct-pos');
            const currentTop = parseInt(piece.css('top'), 10);
            const currentLeft = parseInt(piece.css('left'), 10);
            
            if (currentTop === correctPos.top && currentLeft === correctPos.left) {
                correctPieces++;
            }
        });

        if (correctPieces === 9) {
            $('#puzzle-success-message').removeClass('hidden');
            $('.puzzle-piece').draggable('disable').css('cursor', 'default');
            $('#puzzle-container').addClass('completed');
        }
    }

    // 4. Финальная анимация (Закрытие книги)
    function closeBookAndEnd() {
        // Плавно убираем книгу
        $('#book-container').fadeOut(1000, function() {
            // Планета и звезды остаются! Запускаем поверх них звездопад:
            const animationContainer = $('#final-animation-container');
            const symbols = ['💖', '✨', '🌟', '💕', '⭐', '❤️'];
            
            setInterval(() => {
                const symbol = $('<div></div>').addClass('falling-symbol');
                symbol.text(symbols[Math.floor(Math.random() * symbols.length)]);
                symbol.css({
                    left: Math.random() * 100 + 'vw',
                    fontSize: Math.random() * 20 + 15 + 'px',
                    animationDuration: Math.random() * 5 + 5 + 's',
                    animationDelay: Math.random() * 2 + 's'
                });
                animationContainer.append(symbol);

                setTimeout(() => { symbol.remove(); }, 10000);
            }, 200);
        });
    }
});
