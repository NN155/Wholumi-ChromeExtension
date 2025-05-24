import { useLayoutEffect, useRef } from "react";

// CSS класс можно определить в отдельном CSS файле:
// .fixed-scroll {
//   overflow-y: scroll;
//   position: fixed;
//   width: 100%;
// }

export function useScrollLock(lock = true) {
  const scrollY = useRef(0);

  useLayoutEffect(() => {
    if (!lock) {
      // Если блокировка отключена, но класс был добавлен ранее - удалить его
      if (document.body.classList.contains('fixed-scroll')) {
        document.body.classList.remove('fixed-scroll');
        window.scrollTo(0, scrollY.current);
      }
      return;
    }

    // Сохраняем текущую позицию прокрутки перед блокировкой
    scrollY.current = window.scrollY;
    
    // Устанавливаем верхний отступ, чтобы сохранить текущую позицию просмотра
    document.body.style.top = `-${scrollY.current}px`;
    
    // Добавляем CSS класс для блокировки прокрутки
    document.body.classList.add('fixed-scroll');
    
    return () => {
      // Удаляем CSS класс при размонтировании
      if (document.body.classList.contains('fixed-scroll')) {
        document.body.classList.remove('fixed-scroll');
        document.body.style.top = '';
        
        // Восстанавливаем позицию прокрутки
        window.scrollTo(0, scrollY.current);
      }
    };
  }, [lock]);
}