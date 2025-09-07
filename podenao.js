// podenao.js - Proteção leve contra inspeção e clonagem
(function() {
    'use strict';
    
    // Configurações de proteção
    const config = {
        maxInspectAttempts: 3,
        redirectUrl: 'https://www.google.com',
        delayBeforeRedirect: 500,
        allowDevTools: false
    };
    
    let inspectAttempts = 0;
    
    // Função para redirecionar rapidamente
    function redirectToGoogle() {
        if (inspectAttempts >= config.maxInspectAttempts) {
            setTimeout(() => {
                window.location.href = config.redirectUrl;
            }, config.delayBeforeRedirect);
        }
    }
    
    // Bloqueia clique direito de forma suave
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        inspectAttempts++;
        redirectToGoogle();
    });
    
    // Detecta teclas de atalho comuns para inspeção
    document.addEventListener('keydown', function(e) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            inspectAttempts++;
            redirectToGoogle();
        }
    };
    
    // Detecta abertura do DevTools
    if (!config.allowDevTools) {
        const devtools = /./;
        devtools.toString = function() {
            inspectAttempts++;
            redirectToGoogle();
            return 'devtools';
        };
        
        console.log('%c', devtools);
        
        // Verificação alternativa de tamanho
        let devtoolsOpen = false;
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    inspectAttempts++;
                    redirectToGoogle();
                }
            } else {
                devtoolsOpen = false;
            }
        }, 500);
    }
    
    // Proteção contra clonagem via ferramentas comuns
    const antiClone = {
        // Detecta ferramentas de clonagem conhecidas
        detectTools: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            const suspicious = [
                'cyotek', 'httrack', 'wget', 'curl', 'scrapy', 
                'phantomjs', 'selenium', 'webdriver'
            ];
            
            return suspicious.some(tool => userAgent.includes(tool));
        },
        
        // Adiciona ruído ao conteúdo se detectar clonagem
        addNoise: function() {
            if (this.detectTools()) {
                document.body.style.display = 'none';
                redirectToGoogle();
            }
        }
    };
    
    // Executa verificação de clonagem
    antiClone.addNoise();
    
    // Proteção contra seleção de texto excessiva
    let selectionCount = 0;
    document.addEventListener('selectstart', function(e) {
        selectionCount++;
        if (selectionCount > 10) {
            e.preventDefault();
            inspectAttempts++;
            redirectToGoogle();
        }
    });
    
    // Limpa contador de seleção periodicamente
    setInterval(() => {
        selectionCount = 0;
    }, 5000);
    
    // Proteção contra drag and drop de imagens
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            inspectAttempts++;
            redirectToGoogle();
        }
    });
    
    // Detecta impressão (possível tentativa de salvar)
    window.addEventListener('beforeprint', function() {
        inspectAttempts++;
        redirectToGoogle();
    });
    
    // Adiciona pequeno atraso para evitar falsos positivos
    let lastActivity = Date.now();
    
    function resetAttempts() {
        if (Date.now() - lastActivity > 30000) { // 30 segundos
            inspectAttempts = 0;
        }
        lastActivity = Date.now();
    }
    
    // Reset de tentativas em atividades normais
    document.addEventListener('click', resetAttempts);
    document.addEventListener('scroll', resetAttempts);
    document.addEventListener('mousemove', resetAttempts);
    
    // Log silencioso para debug (remover em produção)
    console.log('Proteção podenao.js ativada');
    
})();