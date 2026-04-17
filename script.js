/**
 * ============================================================
 * COMUNIDADE SOLIDÁRIA — script.js
 *
 * O JavaScript adiciona INTERATIVIDADE ao site:
 * cliques, animações, formulários, menus etc.
 *
 * ORGANIZAÇÃO DO ARQUIVO:
 * 1.  Inicialização dos ícones (Lucide)
 * 2.  Navbar: efeito de sombra ao rolar + menu mobile
 * 3.  Rolagem suave dos links de navegação
 * 4.  Animações de entrada ao rolar (Intersection Observer)
 * 5.  Contador animado das estatísticas do hero
 * 6.  Sistema de abas (Empregos / Bicos)
 * 7.  Modal de pedido de ajuda
 * 8.  Formulário de pedido de ajuda
 * 9.  Utilitários gerais
 * ============================================================
 */

// ============================================================
// AGUARDAR O DOM ESTAR COMPLETAMENTE CARREGADO
// 'DOMContentLoaded' garante que o HTML já foi processado
// pelo navegador antes de tentarmos manipular os elementos.
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // Inicializa todos os ícones da biblioteca Lucide
  // Isso substitui as tags <i data-lucide="nome"> pelos SVGs reais
  lucide.createIcons();

  // Chama todas as funções de inicialização
  initNavbar();
  initSmoothScroll();
  initScrollAnimations();
  initCounterAnimation();
  initTabs();
  initHelpModal();
  initHelpForm();
});


// ============================================================
// 1. INICIALIZAÇÃO DOS ÍCONES LUCIDE
// Após qualquer alteração dinâmica no DOM que adicione
// novos elementos com ícones, chame lucide.createIcons() novamente.
// ============================================================
// (já chamado no DOMContentLoaded acima)


// ============================================================
// 2. NAVBAR — Efeito de sombra ao rolar + Menu Mobile
// ============================================================
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu    = document.getElementById('navMenu');

  // --- Efeito de sombra ao rolar ---
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
  }, { passive: true });

  // --- Função auxiliar: define o estado do menu ---
  function setMenuOpen(open) {
    navMenu.classList.toggle('navbar__menu--open', open);

    // Troca o ícone hambúrguer ↔ X
    menuToggle.innerHTML = open
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';
    lucide.createIcons();

    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');

    // Bloqueia/libera rolagem da página quando o menu estiver aberto
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // --- Toggle ao clicar no hambúrguer ---
  menuToggle.addEventListener('click', function (e) {
    e.stopPropagation(); // Impede que o clique "escape" para o document
    const isOpen = navMenu.classList.contains('navbar__menu--open');
    setMenuOpen(!isOpen);
  });

  // --- Fechar ao clicar num link de navegação ---
  navMenu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });

  // --- Fechar ao clicar fora do menu (tap em qualquer área da página) ---
  document.addEventListener('click', function (e) {
    if (
      navMenu.classList.contains('navbar__menu--open') &&
      !navMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  // --- Fechar com a tecla Escape ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('navbar__menu--open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}


// ============================================================
// 3. ROLAGEM SUAVE
// Garante que ao clicar em qualquer link âncora (#section),
// a página role suavemente até a seção, compensando a navbar.
// ============================================================
function initSmoothScroll() {
  // Seleciona todos os links que começam com '#'
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const href = this.getAttribute('href');

      // Ignora links com href="#" (que seriam a própria página)
      if (href === '#') return;

      const targetElement = document.querySelector(href);

      if (targetElement) {
        event.preventDefault(); // Cancela o comportamento padrão do browser

        // Calcula a posição levando em conta a altura da navbar
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        // Rola suavemente até a posição calculada
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}


// ============================================================
// 4. ANIMAÇÕES DE ENTRADA AO ROLAR (Intersection Observer)
//
// O Intersection Observer é uma API moderna do browser que
// detecta quando um elemento entra na área visível da tela
// (o "viewport"), sem precisar checar a posição durante o scroll.
// É muito mais eficiente do que usar scroll events para isso.
// ============================================================
function initScrollAnimations() {
  // Seleciona todos os elementos com o atributo data-animate
  const animatableElements = document.querySelectorAll('[data-animate]');

  // Cria o observer: quando um elemento entra na tela,
  // adiciona a classe --visible (que dispara a animação CSS)
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        // entry.isIntersecting = true quando o elemento entrou na tela
        if (entry.isIntersecting) {
          entry.target.classList.add('--visible');

          // Para de observar o elemento após animar
          // (evita reverter a animação ao sair da tela)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,    // Dispara quando 10% do elemento estiver visível
      rootMargin: '0px 0px -40px 0px' // Adia um pouco a animação (mais natural)
    }
  );

  // Registra cada elemento para ser observado
  animatableElements.forEach(function (element) {
    observer.observe(element);
  });
}


// ============================================================
// 5. CONTADOR ANIMADO DAS ESTATÍSTICAS
//
// Anima os números das estatísticas no hero de 0 até o valor final,
// criando um efeito de "contagem" que chama atenção do usuário.
// ============================================================
function initCounterAnimation() {
  // Seleciona todos os elementos com data-count (os números a animar)
  const counters = document.querySelectorAll('[data-count]');

  // Usa o IntersectionObserver para iniciar a contagem apenas
  // quando os números entrarem na tela
  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 } // Inicia quando 50% do elemento estiver visível
  );

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });
}

/**
 * Anima um elemento de 0 até o valor definido em data-count
 * @param {HTMLElement} element - O elemento a animar
 */
function animateCounter(element) {
  const targetValue = parseInt(element.getAttribute('data-count'), 10);
  const duration = 1500;   // Duração total da animação em ms
  const startTime = performance.now(); // Marca o início

  // requestAnimationFrame cria um loop suave sincronizado com o monitor
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // Valor entre 0 e 1

    // Easing: faz a contagem desacelerar no final (mais natural)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Atualiza o texto com o valor atual
    const currentValue = Math.round(easedProgress * targetValue);
    element.textContent = currentValue;

    // Continua o loop enquanto não chegou ao final
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = targetValue; // Garante o valor exato no final
    }
  }

  requestAnimationFrame(updateCounter);
}


// ============================================================
// 6. SISTEMA DE ABAS (Empregos / Bicos)
//
// Controla qual aba está ativa e qual painel de conteúdo
// está visível. Simples e acessível.
// ============================================================
function initTabs() {
  // Seleciona todos os botões de aba
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Pega o identificador da aba (ex: "empregos" ou "bicos")
      const tabId = this.getAttribute('data-tab');

      // --- Remove o estado ativo de TODOS os botões ---
      tabButtons.forEach(function (btn) {
        btn.classList.remove('tab-btn--active');
      });

      // --- Esconde TODOS os painéis ---
      const allPanels = document.querySelectorAll('.tab-panel');
      allPanels.forEach(function (panel) {
        panel.classList.remove('tab-panel--active');
      });

      // --- Ativa o botão clicado ---
      this.classList.add('tab-btn--active');

      // --- Mostra o painel correspondente à aba clicada ---
      const activePanel = document.getElementById('tab-' + tabId);
      if (activePanel) {
        activePanel.classList.add('tab-panel--active');

        // Re-inicializa animações nos elementos do painel recém-aberto
        const newElements = activePanel.querySelectorAll('[data-animate]:not(.--visible)');
        newElements.forEach(function (el, index) {
          // Adiciona um pequeno atraso progressivo para cada card
          setTimeout(function () {
            el.classList.add('--visible');
          }, index * 80);
        });
      }
    });
  });
}


// ============================================================
// 7. MODAL DE PEDIDO DE AJUDA
//
// Controla a abertura e o fechamento do modal de formulário.
// Também lida com acessibilidade (foco e tecla Escape).
// ============================================================
function initHelpModal() {
  const modal = document.getElementById('helpModal');
  const openBtn = document.getElementById('openHelpModal');
  const closeBtn = document.getElementById('closeHelpModal');

  // Verifica se os elementos existem antes de adicionar eventos
  if (!modal || !openBtn || !closeBtn) return;

  // --- Abre o modal ---
  openBtn.addEventListener('click', function () {
    openModal();
  });

  // --- Fecha o modal pelo botão X ---
  closeBtn.addEventListener('click', function () {
    closeModal();
  });

  // --- Fecha o modal ao clicar no overlay (fora da caixa branca) ---
  modal.addEventListener('click', function (event) {
    // Verifica se o clique foi no overlay (não no conteúdo do modal)
    if (event.target === modal) {
      closeModal();
    }
  });

  // --- Fecha o modal ao pressionar a tecla Escape ---
  // Comportamento padrão esperado em modais acessíveis
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('modal-overlay--open')) {
      closeModal();
    }
  });

  /**
   * Abre o modal e bloqueia a rolagem da página de fundo
   */
  function openModal() {
    modal.classList.add('modal-overlay--open');
    // Impede a rolagem da página enquanto o modal está aberto
    document.body.style.overflow = 'hidden';

    // Foca no primeiro campo do formulário (acessibilidade)
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(function () { firstInput.focus(); }, 100);
    }
  }

  /**
   * Fecha o modal e restaura a rolagem da página
   */
  function closeModal() {
    modal.classList.remove('modal-overlay--open');
    document.body.style.overflow = ''; // Restaura rolagem
    openBtn.focus(); // Devolve o foco ao botão que abriu o modal
  }
}


// ============================================================
// 8. FORMULÁRIO DE PEDIDO DE AJUDA
//
// Valida os campos e exibe feedback ao usuário.
// Em produção, aqui você enviaria os dados para um servidor
// ou para a API do WhatsApp Business.
// ============================================================
function initHelpForm() {
  const form = document.getElementById('helpForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os valores dos campos
    const name    = document.getElementById('helpName').value.trim();
    const type    = document.getElementById('helpType').value;
    const message = document.getElementById('helpMessage').value.trim();
    const contact = document.getElementById('helpContact').value.trim();

    // --- Validação simples ---
    if (!name || !type || !message || !contact) {
      showFormFeedback(form, 'error', 'Por favor, preencha todos os campos.');
      return;
    }

    if (contact.length < 10) {
      showFormFeedback(form, 'error', 'Informe um número de WhatsApp válido.');
      return;
    }

    // --- Simulação de envio (em produção, envie para um servidor) ---
    // Aqui você poderia usar fetch() para enviar para uma API,
    // ou montar um link de WhatsApp com os dados do pedido.

    // Monta mensagem para WhatsApp (opcional)
    const whatsappMessage = encodeURIComponent(
      `*Novo pedido de ajuda*\n\n` +
      `👤 Nome: ${name}\n` +
      `📋 Tipo: ${type}\n` +
      `📝 Pedido: ${message}\n` +
      `📞 Contato: ${contact}`
    );

    // Feedback de sucesso
    showFormFeedback(form, 'success', '✅ Pedido publicado com sucesso! Em breve alguém entrará em contato.');

    // Limpa o formulário após envio
    form.reset();

    // Fecha o modal após 2 segundos
    setTimeout(function () {
      document.getElementById('helpModal').classList.remove('modal-overlay--open');
      document.body.style.overflow = '';
      // Remove o feedback
      const feedback = form.querySelector('.form-feedback');
      if (feedback) feedback.remove();
    }, 2500);
  });
}

/**
 * Exibe uma mensagem de feedback dentro do formulário
 * @param {HTMLFormElement} form - O formulário
 * @param {'success'|'error'} type - Tipo de feedback
 * @param {string} message - Mensagem a exibir
 */
function showFormFeedback(form, type, message) {
  // Remove feedback anterior se houver
  const existingFeedback = form.querySelector('.form-feedback');
  if (existingFeedback) existingFeedback.remove();

  // Cria o elemento de feedback
  const feedback = document.createElement('div');
  feedback.className = 'form-feedback';

  // Estilos inline para não precisar de CSS extra
  Object.assign(feedback.style, {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '8px',
    background: type === 'success' ? '#dcfce7' : '#fee2e2',
    color: type === 'success' ? '#166534' : '#991b1b',
    border: `1px solid ${type === 'success' ? '#86efac' : '#fca5a5'}`
  });

  feedback.textContent = message;

  // Insere o feedback antes do botão de submit
  const submitBtn = form.querySelector('[type="submit"]');
  form.insertBefore(feedback, submitBtn);

  // Se for erro, remove automaticamente após 4 segundos
  if (type === 'error') {
    setTimeout(function () {
      if (feedback.parentNode) feedback.remove();
    }, 4000);
  }
}


// ============================================================
// 9. UTILITÁRIOS GERAIS
// ============================================================

/**
 * Destaca o link ativo na navbar ao rolar entre seções.
 * Usa o IntersectionObserver para detectar qual seção está visível.
 */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;

          // Remove a classe ativa de todos os links
          navLinks.forEach(function (link) {
            link.classList.remove('nav-link--active-scroll');
            link.style.removeProperty('background');
            link.style.removeProperty('color');
          });

          // Adiciona destaque ao link correspondente à seção atual
          const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
          if (activeLink && !activeLink.classList.contains('nav-link--cta')) {
            activeLink.style.color = '#16a34a'; // Verde para o link ativo
          }
        }
      });
    },
    {
      threshold: 0.3,             // 30% da seção visível para ativar
      rootMargin: '-64px 0px 0px 0px' // Compensação da navbar
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });
})();


/**
 * Formata número de telefone enquanto o usuário digita
 * Transforma "11999999999" em "(11) 9 9999-9999"
 */
(function initPhoneMask() {
  const phoneInput = document.getElementById('helpContact');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, ''); // Remove tudo que não é dígito

    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

    // Aplica a máscara progressivamente conforme o usuário digita
    if (value.length > 10) {
      // Celular: (00) 0 0000-0000
      value = value.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    } else if (value.length > 6) {
      // Telefone fixo: (00) 0000-0000
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d+)/, '($1) $2');
    }

    this.value = value;
  });
})();


/**
 * Log de inicialização no console (útil para desenvolvimento)
 * Em produção, você pode remover esse trecho.
 */
console.log(
  '%c🌿 Comunidade Solidária — Site carregado com sucesso!',
  'color: #16a34a; font-weight: bold; font-size: 14px;'
);
