document.addEventListener('DOMContentLoaded', () => {

    // --- Магическая пыльца (Particles) ---
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = 45; // Количество частичек
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 4 + 2; // размер 2-6 px
            const posX = Math.random() * 100; // по X
            const delay = Math.random() * 10; // задержка
            const duration = Math.random() * 15 + 10; // длительность 10-25 сек
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            // Чередуем розовый и холодный синеватый цвет как на озере
            if (Math.random() > 0.6) {
                particle.style.backgroundColor = '#93c5fd'; 
                particle.style.boxShadow = '0 0 12px 3px rgba(147, 197, 253, 0.8)';
            }
            
            particlesContainer.appendChild(particle);
        }
    }

    // --- Функция копирования текста (Промпты) ---
    const copyButtons = document.querySelectorAll('.cadis-copy-btn');
    const toast = document.getElementById('toast');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const directText = button.getAttribute('data-clipboard-text');
            
            let textToCopy = "";
            if (directText) {
                textToCopy = directText;
            } else if (targetId) {
                textToCopy = document.getElementById(targetId).innerText.trim();
            }

            if (!textToCopy) return;

            // Используем Clipboard API для копирования
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast();
                
                // Визуальная обратная связь на кнопке (если это иконка, можно поменять цвет)
                const originalColor = button.style.color;
                button.style.color = '#4CAF50'; // Зеленый цвет успеха
                setTimeout(() => {
                    button.style.color = originalColor;
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
                alert('Не удалось скопировать текст. Попробуйте выделить его вручную.');
            });
        });
    });

    // Функция показа уведомления
    function showToast() {
        toast.classList.add('show');
        
        // Скрываем уведомление через 3 секунды
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Раскрытие карточек расширений (Модальное окно) ---
    const toggleBtns = document.querySelectorAll('.toggle-details-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    if (modalOverlay) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                const detailsDiv = document.getElementById(targetId);
                
                if (detailsDiv) {
                    modalBody.innerHTML = detailsDiv.innerHTML;
                    
                    // Переподключаем слушатель для кнопки внутри модалки
                    const modalCopyBtn = modalBody.querySelector('.cadis-copy-btn');
                    if (modalCopyBtn) {
                        modalCopyBtn.addEventListener('click', () => {
                            const directText = modalCopyBtn.getAttribute('data-clipboard-text');
                            if (directText) {
                                navigator.clipboard.writeText(directText).then(() => {
                                    showToast();
                                    const originalColor = modalCopyBtn.style.color;
                                    modalCopyBtn.style.color = '#4CAF50';
                                    setTimeout(() => { modalCopyBtn.style.color = originalColor; }, 2000);
                                });
                            }
                        });
                    }

                    modalOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // блокируем скролл страницы
                }
            });
        });

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { modalBody.innerHTML = ''; }, 300);
        };

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- Галерея промптов (Фильтрация и Модальное окно) ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const promptModalOverlay = document.getElementById('prompt-modal-overlay');
    const promptModalClose = document.getElementById('prompt-modal-close');
    const promptModalImg = document.getElementById('prompt-modal-img');
    const promptModalText = document.getElementById('prompt-modal-text');
    const promptModalCopyBtn = document.getElementById('prompt-modal-copy-btn');

    // Кнопка быстрого копирования прямо на карточке промпта
    galleryItems.forEach(item => {
        const text = item.getAttribute('data-prompt');
        if (!text || item.hasAttribute('data-link')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'card-copy-btn';
        btn.textContent = 'Скопировать';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text).then(() => {
                showToast();
                btn.textContent = 'Скопировано ✓';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Скопировать';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => console.error('Ошибка копирования: ', err));
        });
        item.appendChild(btn);
    });

    // Автоматическое присвоение data-id на основе имени файла картинки
    galleryItems.forEach(item => {
        if (!item.hasAttribute('data-id')) {
            const img = item.querySelector('img');
            if (img) {
                const src = img.getAttribute('src') || '';
                const filenameMatch = src.match(/([^\/]+)\.(jpg|png|webp|jpeg)$/i);
                if (filenameMatch) {
                    item.setAttribute('data-id', filenameMatch[1]);
                }
            }
        }
    });

    // Фильтрация
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const isAllBtn = btn.getAttribute('data-filter') === 'all';
                const isActive = btn.classList.contains('active');
                
                if (isAllBtn) {
                    if (!isActive) {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                } else {
                    if (isActive) {
                        btn.classList.remove('active');
                    } else {
                        btn.classList.add('active');
                        // Remove active from 'all' button
                        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                        if (allBtn) allBtn.classList.remove('active');
                    }
                    
                    // If no buttons are active now, make 'all' active
                    const activeBtns = Array.from(filterBtns).filter(b => b.classList.contains('active') && b.getAttribute('data-filter') !== 'all');
                    if (activeBtns.length === 0) {
                        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                        if (allBtn) allBtn.classList.add('active');
                    }
                }

                // Get all active filters
                const activeFilters = Array.from(filterBtns)
                    .filter(b => b.classList.contains('active') && b.getAttribute('data-filter') !== 'all')
                    .map(b => b.getAttribute('data-filter'));

                galleryItems.forEach(item => {
                    if (activeFilters.length === 0) {
                        item.classList.remove('hidden');
                    } else {
                        const tags = item.getAttribute('data-tags');
                        const itemTags = tags ? tags.split(' ') : [];
                        // Check if item contains ALL active filters
                        const hasAllTags = activeFilters.every(filter => itemTags.includes(filter));
                        
                        if (hasAllTags) {
                            item.classList.remove('hidden');
                        } else {
                            item.classList.add('hidden');
                        }
                    }
                });
            });
        });
    }

    // Открытие модалки промпта
    if (galleryItems.length > 0 && promptModalOverlay) {
        let currentModalImages = [];
        let currentModalImgIndex = 0;
        const modalPrevBtn = document.getElementById('modal-prev-btn');
        const modalNextBtn = document.getElementById('modal-next-btn');

        const updateModalImage = () => {
            if (currentModalImages.length > 0) {
                promptModalImg.src = currentModalImages[currentModalImgIndex];
                promptModalImg.style.display = 'block';
                if (currentModalImages.length > 1) {
                    if (modalPrevBtn) modalPrevBtn.style.display = 'flex';
                    if (modalNextBtn) modalNextBtn.style.display = 'flex';
                } else {
                    if (modalPrevBtn) modalPrevBtn.style.display = 'none';
                    if (modalNextBtn) modalNextBtn.style.display = 'none';
                }
            } else {
                promptModalImg.style.display = 'none';
                if (modalPrevBtn) modalPrevBtn.style.display = 'none';
                if (modalNextBtn) modalNextBtn.style.display = 'none';
            }
        };

        const showPrevModalImg = () => {
            if (currentModalImages.length <= 1) return;
            currentModalImgIndex = (currentModalImgIndex - 1 + currentModalImages.length) % currentModalImages.length;
            updateModalImage();
        };

        const showNextModalImg = () => {
            if (currentModalImages.length <= 1) return;
            currentModalImgIndex = (currentModalImgIndex + 1) % currentModalImages.length;
            updateModalImage();
        };

        if (modalPrevBtn) modalPrevBtn.addEventListener('click', showPrevModalImg);
        if (modalNextBtn) modalNextBtn.addEventListener('click', showNextModalImg);

        // Клавиатурные стрелки при открытой модалке
        document.addEventListener('keydown', (e) => {
            if (promptModalOverlay.classList.contains('active') && currentModalImages.length > 1) {
                if (e.key === 'ArrowLeft') showPrevModalImg();
                if (e.key === 'ArrowRight') showNextModalImg();
            }
        });

        // Свайпы на мобильных в модалке
        let modalTouchStartX = 0;
        let modalTouchEndX = 0;
        const modalImgContainer = document.querySelector('.prompt-modal-image-container');
        if (modalImgContainer) {
            modalImgContainer.addEventListener('touchstart', e => {
                modalTouchStartX = e.changedTouches[0].screenX;
            }, {passive: true});
            modalImgContainer.addEventListener('touchend', e => {
                modalTouchEndX = e.changedTouches[0].screenX;
                if (modalTouchStartX - modalTouchEndX > 50) showNextModalImg();
                if (modalTouchEndX - modalTouchStartX > 50) showPrevModalImg();
            }, {passive: true});
        }

        galleryItems.forEach(item => {
            const openModal = () => {
                const img = item.querySelector('img');
                const imagesAttr = item.getAttribute('data-images');
                if (imagesAttr) {
                    currentModalImages = imagesAttr.split(',').map(s => s.trim()).filter(Boolean);
                    currentModalImgIndex = 0;
                } else if (img) {
                    currentModalImages = [img.src];
                    currentModalImgIndex = 0;
                } else {
                    currentModalImages = [];
                    currentModalImgIndex = 0;
                }

                const promptText = item.getAttribute('data-prompt') || '';
                const tags = item.getAttribute('data-tags') ? item.getAttribute('data-tags').split(' ') : [];
                const note = item.getAttribute('data-note') || '';
                const externalLink = item.getAttribute('data-link');

                const updateContent = () => {
                    // Заполняем мета-информацию
                    const metaContainer = document.getElementById('prompt-modal-meta');
                    if (metaContainer) {
                        let metaHTML = '';
                        
                        const tagDisplayNames = {
                            'nano-pro': 'Nano Banana Pro',
                            'nano-lite': 'Nano Banana 2 Lite',
                            'meme': 'Meme',
                            'gacha': 'Gacha',
                            'solo': 'Solo',
                            'duo': 'Duo',
                            'female': 'Female',
                            'male': 'Male',
                            'fantasy': 'Fantasy',
                            'modern': 'Modern',
                            'costume': 'Costume',
                            'wedding': 'Wedding',
                            'collection': 'Collection'
                        };
                        
                        // Сначала выводим модель
                        tags.forEach(t => {
                            if (t === 'nano-pro' || t === 'nano-lite') {
                                metaHTML += `<span class="tag">${tagDisplayNames[t]}</span>`;
                            }
                        });
                        
                        // Затем остальные теги
                        tags.forEach(t => {
                            if (t && t !== 'nano-pro' && t !== 'nano-lite') {
                                const displayName = tagDisplayNames[t] || (t.charAt(0).toUpperCase() + t.slice(1));
                                metaHTML += `<span class="tag">${displayName}</span>`;
                            }
                        });
                        
                        // Выводим примечание, если оно есть
                        if (note) {
                            metaHTML += `<div class="prompt-note" style="width: 100%; color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; padding: 0.6rem; background: rgba(217, 123, 181, 0.05); border-left: 3px solid var(--accent-pink); border-radius: 4px;">⚠️ ${note}</div>`;
                        }
                        
                        metaContainer.innerHTML = metaHTML;
                    }

                    updateModalImage();

                    promptModalText.textContent = promptText;
                    
                    // Логика сворачивания текста для мобильных
                    const textWrapper = document.getElementById('prompt-modal-text-wrapper');
                    const toggleBtn = document.getElementById('prompt-modal-toggle-btn');
                    const fadeEl = document.getElementById('prompt-modal-fade');
                    
                    if (textWrapper && toggleBtn && fadeEl) {
                        // Сбрасываем состояния
                        promptModalText.classList.remove('collapsed', 'expanded');
                        textWrapper.classList.remove('expanded');
                        toggleBtn.classList.remove('active');
                        fadeEl.classList.remove('active');
                        toggleBtn.style.display = 'none';
                        
                        // Проверяем высоту после рендера текста
                        setTimeout(() => {
                            // Только для мобильных устройств, если текст слишком длинный
                            if (window.innerWidth <= 768 && promptModalText.scrollHeight > 140) {
                                promptModalText.classList.add('collapsed');
                                toggleBtn.classList.add('active');
                                fadeEl.classList.add('active');
                                toggleBtn.textContent = 'Развернуть';
                                toggleBtn.style.display = 'block';
                            }
                        }, 10);
                    }
                    
                    if (externalLink) {
                        promptModalCopyBtn.textContent = 'Перейти к коллекции';
                        promptModalCopyBtn.onclick = () => {
                            window.open(externalLink, '_blank');
                        };
                    } else {
                        promptModalCopyBtn.textContent = 'Скопировать промпт';
                        promptModalCopyBtn.onclick = () => {
                            if (promptText) {
                                navigator.clipboard.writeText(promptText).then(() => {
                                    showToast();
                                    const originalText = promptModalCopyBtn.textContent;
                                    promptModalCopyBtn.textContent = 'Скопировано!';
                                    promptModalCopyBtn.style.backgroundColor = '#4CAF50';
                                    promptModalCopyBtn.style.borderColor = '#4CAF50';
                                    setTimeout(() => { 
                                        promptModalCopyBtn.textContent = originalText; 
                                        promptModalCopyBtn.style.backgroundColor = '';
                                        promptModalCopyBtn.style.borderColor = '';
                                    }, 2000);
                                });
                            }
                        };
                    }

                    // Логика связанных промптов
                    const relatedContainer = document.getElementById('prompt-modal-related-container');
                    const relatedList = document.getElementById('prompt-modal-related-list');
                    if (relatedContainer && relatedList) {
                        relatedList.innerHTML = '';
                        const relatedIdsStr = item.getAttribute('data-related');
                        if (relatedIdsStr) {
                            const relatedIds = relatedIdsStr.split(',').map(id => id.trim());
                            let foundAny = false;
                            
                            galleryItems.forEach(gItem => {
                                const gId = gItem.getAttribute('data-id');
                                if (gId && relatedIds.includes(gId)) {
                                    foundAny = true;
                                    const relatedImg = gItem.querySelector('img');
                                    if (relatedImg) {
                                        const thumb = document.createElement('div');
                                        thumb.className = 'related-item';
                                        thumb.innerHTML = `<img src="${relatedImg.src}" alt="Prompt ${gId}">`;
                                        thumb.title = `Открыть связанный промпт ${gId}`;
                                        thumb.addEventListener('click', () => {
                                            if (gItem.openModal) gItem.openModal();
                                        });
                                        relatedList.appendChild(thumb);
                                    }
                                }
                            });
                            
                            if (foundAny) {
                                relatedContainer.style.display = 'block';
                            } else {
                                relatedContainer.style.display = 'none';
                            }
                        } else {
                            relatedContainer.style.display = 'none';
                        }
                    }
                };

                // Сброс скролла и плавное переключение, если модалка уже открыта
                if (promptModalOverlay.classList.contains('active')) {
                    const modalBody = document.querySelector('.prompt-modal-body');
                    const textContainer = document.querySelector('.prompt-modal-text-container');
                    
                    if (modalBody && textContainer) {
                        modalBody.classList.add('prompt-modal-transition-fade');
                        
                        setTimeout(() => {
                            updateContent();
                            // Сбрасываем скролл
                            modalBody.scrollTop = 0;
                            textContainer.scrollTop = 0;
                            
                            setTimeout(() => {
                                modalBody.classList.remove('prompt-modal-transition-fade');
                            }, 50);
                        }, 150);
                    } else {
                        updateContent();
                    }
                } else {
                    updateContent();
                    // Сброс скролла при первом открытии
                    const modalBody = document.querySelector('.prompt-modal-body');
                    const textContainer = document.querySelector('.prompt-modal-text-container');
                    if (modalBody) modalBody.scrollTop = 0;
                    if (textContainer) textContainer.scrollTop = 0;
                    
                    promptModalOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            };

            item.openModal = openModal;
            item.addEventListener('click', openModal);
        });

        const closePromptModal = () => {
            promptModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        promptModalClose.addEventListener('click', closePromptModal);
        promptModalOverlay.addEventListener('click', (e) => {
            if (e.target === promptModalOverlay) closePromptModal();
        });
        
        // Подсчет общего количества промптов
        const calculateTotalPrompts = () => {
            let total = 0;
            galleryItems.forEach(item => {
                if (item.classList.contains('collection-item') || item.hasAttribute('data-count')) {
                    const count = parseInt(item.getAttribute('data-count') || '0');
                    total += count;
                } else {
                    total += 1;
                }
            });
            
            const counterEl = document.getElementById('total-prompts-counter');
            if (counterEl) {
                counterEl.textContent = `${total} шт.`;
            }
        };

        // Запускаем подсчет при инициализации
        calculateTotalPrompts();
        
        // Открытие промпта по хешу из URL
        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            const targetItem = document.getElementById(hashId);
            if (targetItem && targetItem.classList.contains('gallery-item')) {
                setTimeout(() => {
                    targetItem.click();
                    // Скроллим к элементу для удобства
                    targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            }
        }
    }

    // Обработчик кнопки развертывания текста промпта
    const togglePromptBtn = document.getElementById('prompt-modal-toggle-btn');
    if (togglePromptBtn) {
        togglePromptBtn.addEventListener('click', () => {
            const textEl = document.getElementById('prompt-modal-text');
            const textWrapper = document.getElementById('prompt-modal-text-wrapper');
            
            if (textEl.classList.contains('collapsed')) {
                textEl.classList.remove('collapsed');
                textEl.classList.add('expanded');
                textWrapper.classList.add('expanded');
                togglePromptBtn.textContent = 'Свернуть';
            } else {
                textEl.classList.remove('expanded');
                textEl.classList.add('collapsed');
                textWrapper.classList.remove('expanded');
                togglePromptBtn.textContent = 'Развернуть';
            }
        });
    }

    // Инициализация каруселей прокрутки картинок в карточках (на странице промптов и других)
    const promptCarousels = document.querySelectorAll('.gallery-item .style-carousel');
    promptCarousels.forEach(carousel => {
        const dotsContainer = carousel.nextElementSibling;
        const dots = dotsContainer && dotsContainer.classList.contains('carousel-pagination') ? 
                     dotsContainer.querySelectorAll('.carousel-dot') : [];
        
        carousel.addEventListener('scroll', () => {
            if (dots.length > 0) {
                const scrollPosition = carousel.scrollLeft;
                const itemWidth = carousel.clientWidth;
                const activeIndex = Math.round(scrollPosition / itemWidth);
                dots.forEach(d => d.classList.remove('active'));
                if (dots[activeIndex]) {
                    dots[activeIndex].classList.add('active');
                }
            }
        }, { passive: true });
        
        // Drag-to-scroll для мыши
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            hasDragged = false;
            carousel.style.cursor = 'grabbing';
            carousel.style.scrollSnapType = 'none';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = '';
            carousel.style.scrollSnapType = '';
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = '';
            carousel.style.scrollSnapType = '';
            requestAnimationFrame(() => {
                if (carousel.scrollLeft !== scrollLeft) {
                    carousel.scrollLeft += (carousel.scrollLeft > scrollLeft ? 1 : -1);
                }
            });
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });

        // Предотвращаем клик открытия модалки, если пользователь перетаскивал картинки мышью
        carousel.addEventListener('click', (e) => {
            if (hasDragged) {
                e.stopPropagation();
            }
        }, true);
    });
    // Логика копирования оверлеев с карточки
    const copyOverlayBtns = document.querySelectorAll('.copy-overlay-btn');
    copyOverlayBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Чтобы не кликнулось на карточку, если кнопка вдруг перекрывает
            const promptText = btn.getAttribute('data-prompt');
            if (promptText) {
                navigator.clipboard.writeText(promptText).then(() => {
                    if (window.showToast) window.showToast();
                    const originalText = btn.textContent;
                    btn.textContent = 'Скопировано! ✓';
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.borderColor = '#4CAF50';
                    btn.style.color = 'white';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.borderColor = '';
                        btn.style.color = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
            }
        });
    });

});
