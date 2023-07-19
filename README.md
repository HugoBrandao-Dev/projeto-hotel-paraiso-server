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
* MongoDB: SGBD para armazenamento de dados.

### Outra(s)
* NPM: Para gerenciamento de pacotes;
* Mongoose: Modelador de objeto MongoDB para Node.JS;
* Supertest: Módulo para realização de requisições, neste caso foi utilizado em testes com Jest;
* CORS: Pacote que possibilita requisições na mesma origem do servidor;
* Axios: Cliente HTTP para as requisições internas no projeto;
* UUID: Pacote de geração de IDs. Utilizado durante os testes com o Jest.

## Possíveis melhorias futuras

## Bug(s)
* Validação do Email: No método de validação de email, implementar o teste e o codigo para verificar se o email informado pelo usuário já foi cadastrado.

## Informações adicionais
### Jest e o this dos métodos de uma rota
* Métodos, que são usados para atender uma rota, como é o caso do create do UserController, não conseguem reconhecer o this de sua classe, sendo impossível chamar outros métodos da mesma.