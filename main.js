/**
 * Main Module - Funções gerais do site
 */
const MainModule = (function () {
  // Elementos DOM comuns
  const toastContainer = document.getElementById("toast-container");

  // Inicialização
  function init() {
    setupEventListeners();
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Implementar conforme necessário
  }

  // Função para fazer requisições à API
  async function fetchAPI(url, options = {}) {
    try {
      // Configurar opções padrão
      const defaultOptions = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      };

      // Mesclar opções
      const fetchOptions = { ...defaultOptions, ...options };

      // Adicionar cabeçalhos de autenticação se disponíveis
      if (
        typeof AuthModule !== "undefined" &&
        AuthModule &&
        AuthModule.isAuthenticated()
      ) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          ...AuthModule.getAuthHeaders(),
        };
      }

      // Fazer requisição
      const response = await fetch(url, fetchOptions);

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      // Processar resposta com tratamento de erro melhorado
      let data;
      if (isJson) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("Erro ao processar JSON:", jsonError);
          // Obter o texto da resposta para diagnóstico
          const responseText = await response.text();
          console.error("Resposta recebida:", responseText);
          throw new Error(
            "Erro ao processar resposta do servidor: JSON inválido"
          );
        }
      } else {
        data = await response.text();
      }

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(
          isJson && data.error ? data.error : "Ocorreu um erro na requisição"
        );
      }

      return data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }

  // Função para mostrar toast
  function showToast(message, type = "info") {
    if (!toastContainer) return;

    // Criar elemento toast
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Adicionar ao container
    toastContainer.appendChild(toast);

    // Remover após 3 segundos
    setTimeout(() => {
      toast.classList.add("toast-hide");
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Função para formatar preço
  function formatPrice(price) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  }

  // Função para obter parâmetros da URL
  function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split("&");

    for (const pair of pairs) {
      if (pair === "") continue;

      const parts = pair.split("=");
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "");
    }

    return params;
  }

  // Função para debounce (limitar chamadas de função)
  function debounce(func, wait = 300) {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Exportar funções públicas
  return {
    init,
    fetchAPI,
    showToast,
    formatPrice,
    getUrlParams,
    debounce,
  };
})();

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", MainModule.init);
