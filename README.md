# Descrição
Projeto back-end de __portifólio__, que complementa o projeto front-end [Projeto Hotel Paraíso](https://github.com/HugoBrandao-Dev/projeto-hotel-paraiso).

## Tecnologias

### Framework(s)
* Express JS: Criação de rotas que atenderão as requisições.
* Jest: Para testes TDD.

### Biblioteca(s)
* ValidatorJS: Para validação de determinados valores. Neste projeto, foi utilizada para validar 
campos de formulários de cadastro e atualização de usuário, reservar, etc.

### API(s)
* Country State City: Para busca por informações de países, dos seus estados e cidades;
* ViaCEP: Para busca de informações de um endereço (bairro, rua, etc.), baseado em um CEP.

### Banco de dados
* MongoDB: SGBD para armazenamento de dados. Nesse projeto, tive que utilizar a versão na nuvem do 
MongoDB, que é o MongoDB Atlas, já que __não existe versão para instalação local compatível com meu 
Sistema Operacional (Windows 7, 32-bit)__.

### Outra(s)
* NPM: Para gerenciamento de pacotes;
* Mongoose: Modelador de objeto MongoDB para Node.JS;
* Supertest: Módulo para realização de requisições, neste caso foi utilizado em testes com Jest;
* CORS: Pacote que possibilita requisições na mesma origem do servidor;
* Axios: Cliente HTTP para as requisições internas no projeto;
* UUID: Pacote de geração de IDs. Utilizado durante os testes com o Jest.

## Possíveis melhorias futuras
* Buscar uma forma de unir a listagem de usuários com a busca de usuários pelo documento;
* Se o valor do updatedAt e do createdAt forem iguais, apagar o retorno do updatedAt;
* Durante a armazenagem/atualização das fotos, verificar o mimetype das imagens no Multer;
* Dentro do analyzer, impedir que dados não validados sejam utilizados em consultas nos Models. Por 
exemplo, no analisador de CPF a busca por usuário que possui o CPF é feita _antes de outras 
validações, como ser ou não um inteiro e possuir exatos 11 caracteres_;
* Retirar o código, no cadastro de um usuário, que torna o _primeiro usuário_ a se cadastrar um 
Admin, fazendo com que _cargo (role)_ do usuário seja alterado diretamente no Banco de Dados;
* Integrar a API com a __AWS (Amazon Web Service)__, para que as imagens dos apartamentos sejam 
armazenadas na nuvem, e também com o __Redis__, para que a sessão/token do usuário seja armazenada;
* Concluir a crição de todos os testes com o _Jest_, já que tive que parar de utilizá-lo (
codificá-lo) devido ao tempo de conclusão de todos os testes (meu computador é muito lento) e 
possível "incompatibilidade" (tempo de resposta) com o MongoDB Atlas;
* Impedir que clientes menores de idade se cadastrem ou sejam cadastrados.

## Bug(s)
* Validação do Email: No método de validação de email, implementar o teste e o codigo para verificar 
se o email informado pelo usuário já foi cadastrado;
* Quando o valor de um parâmetro informado não pertence a um dado do documento que se quer obter, o 
valor do Status Code retornado é 404.

## Informações adicionais
### Jest e o this dos métodos de uma rota
* Métodos, que são usados para atender uma rota, como é o caso do create do UserController, não 
conseguem reconhecer o this de sua classe, sendo impossível chamar outros métodos da mesma.