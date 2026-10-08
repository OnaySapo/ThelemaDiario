# 📜 Diário Mágicko Thelêmico

> *"O Método da Ciência — O Alvo da Religião."*  
> — Aleister Crowley, *The Equinox*

---

## 🏛️ Sobre o Projeto

O **Diário Mágicko Thelêmico** é um sistema completo e interativo projetado para o magista registrar suas práticas, experimentos, visões, sonhos e operações oraculares com o rigor preconizado nos livros sagrados de Thelema (*Liber E*, *Liber O*, *Liber 777* e *O Livro de Thoth*).

O programa funciona como um webapp fullstack de alta performance, dotado de banco de dados SQLite local próprio, grafo visual de conexões e assistente analítico integrado (*Frater Auxiliar*) capaz de descobrir padrões e correlações entre condições astrais, influências e taxas de sucesso.

---

## 🌟 Principais Recursos

### 1. 🌌 Motor Astrológico & Thelêmico Automático (100% Offline)
* **Data Thelêmica Canônica**: Calculada com precisão no sistema de ciclos de 22 anos (ex: *☉ in ♎ 15°, Anno V:xii*).
* **Posicionamento do Sol e da Lua**: Grau e minuto exato nos 12 signos zodiacais, calculados por efemérides astronômicas reais.
* **Fases Lunares & Iluminação**: Identificação da fase (Nova, Crescente, Cheia, Minguante, Balsâmica) e porcentagem de iluminação.
* **Regência Planetária**: Dia da semana em latim (*Dies Solis*, *Dies Lunae*, *Dies Martis*, etc.) e hora planetária caldaica ativa no momento da operação.
* **Recálculo Automático**: Ao alterar a data de um ritual passado, o programa recalcula instantaneamente os astros daquele instante.

### 2. 🎴 Abas Especializadas por Tipologia
* **⚔️ Rituais & Práticas**: Banimentos (LRP, Rubi Estrela), invocações, consagrações, evocações, com campos para materiais (armas, velas, incensos), grau de sucesso (0-10), estado mental anterior e posterior, e confirmações fenomênicas.
* **🎴 Oráculos (Tarô de Thoth)**:
  * Baralho completo com as 78 lâminas do Livro de Thoth (Crowley & Lady Frieda Harris).
  * Métodos de tiragem consagrados: Carta do Dia, Passado/Presente/Futuro, Tiragem da Verdadeira Vontade, Hexagrama Planetário e Cruz Céltica.
  * Correspondências do Liber 777 (caminhos cabalísticos, letras hebraicas e astrologia).
  * Registro de perguntas e confirmação posterior no plano físico.
* **🌙 Sonhos Lúcidos**: Anotação de trabalhos no plano dos sonhos (Yesod), lucidez, símbolos e entidades astrais.
* **👁️ Visões & Skrying**: Exploração no espírito, Tattwas (Tejas, Vayu, Apas, Prithivi, Akasha), espelhos negros e testes de autenticidade (senhas e sinais).
* **📖 Estudos Herméticos**: Teses, gematria, comentários da Cabala e hipóteses a serem testadas empiricamente.

### 3. 🕸️ Grafo Interativo de Conexões & Insights
* Mapa visual em rede ligando suas notas e experiências através de relações semânticas:
  * *Resultado Fenomênico de...*
  * *Profetizado / Anunciado por...*
  * *Sincrônico com...*
  * *Referência de Estudo...*
* Física de forças em tempo real (arraste nós, aproxime com scroll do mouse e filtre por categorias).

### 4. 🔮 Frater Auxiliar — Chatbot de Padrões e Correlações
* Assistente mágico capaz de responder perguntas analíticas:
  > *"Quais processos mágickos eu tive mais sucessos e quais influências eles tinham em comum?"*
* Descobre quais fases lunares, signos do zodíaco, entidades invocadas, velas ou incensos geraram maior taxa de sucesso.
* Funciona 100% offline via motor algorítmico e suporta conexão com **Google Gemini** para análises herméticas profundas.

### 5. 🛡️ Soberania dos Dados & Estética Everforest
* **Banco Local Próprio**: Arquivo único `data/magick_diary.db` em SQLite. Seus segredos mágicos permanecem na sua máquina.
* **Backup**: Ferramenta de exportação em JSON e Markdown.
* **Paleta Everforest Dark**: Ambiente visual focado, tons de verde musgo, ouro alquímico e texto pergaminho escuro.

---

## 🚀 Como Iniciar o Programa

### Método Rápido (Windows):
Basta dar **duplo clique** no arquivo executável:
```cmd
iniciar_diario.bat
```
O servidor será iniciado e seu navegador abrirá automaticamente em `http://localhost:3000`.

### Método via Terminal:
```powershell
# Iniciar em modo de produção
npm start

# Ou iniciar em modo de desenvolvimento
npm run dev
```

---

*Faze o que tu queres há de ser tudo da Lei.*  
*Amor é a lei, amor sob vontade.*
