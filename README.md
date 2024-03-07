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

## Endpoints

A maioria dos parâmetros são avaliados utilizando métodos da biblioteca [Validator.js](https://github.com/validatorjs/validator.js).

### POST /users
Faz o cadastro de um cliente.

#### Parâmetros

##### Body
name: Nome do cliente. Obrigatório;  
email: Email de contato do cliente. Obrigatório;  
password: Senha de acesso ao site. É necessário informar uma __senha forte__, favor verificar o 
método _isStrongPassword()_ da biblioteca Validator.js para a saber quais são os requisitos de uma 
senha forte. Obrigatório;  
phoneCode: Código do país do telefone do cliente. Obrigatório;  
phoneNumber: Telefone com o código do estado do cliente. Obrigatório;  
birthDate: Data de nascimento do cliente, no formato yyyy-mm-dd. Obrigatório;  
country: País de nascimento do cliente. Obrigatório;  
state: Estado de nascimento do cliente. Opcional;  
city: Cidade de nascimento do cliente. Opcional;  
cpf: CPF do cliente. Condicional (somente para brasileiros);  
passportNumber: CPF do cliente. Condicional (somente para estrangeiros);  

O exemplo abaixo é do corpo de uma requisição de cadastro de um cliente __brasileiro__.
```json
{
  "name": "Tobias de Oliveira",
  "email": "tobias@gmail.com",
  "password": "T1@odb7iaS&5S9a@1T2",
  "phoneCode": "55",
  "phoneNumber": "11984752352",
  "birthDate": "1985-06-09",
  "country": "BR",
  "state": "SP",
  "city": "São Paulo",
  "cpf": "12112112112"
}
```

O exemplo abaixo é do corpo de uma requisição de cadastro de um cliente __estrangeiro__.
```json
{
  "name": "Dinorá de Oliveira",
  "email": "dinora@gmail.com",
  "password": "Dinor@A51#42",
  "phoneCode": "209",
  "phoneNumber": "5491907",
  "birthDate": "1952-01-09",
  "country": "US",
  "state": "CA",
  "city": "Lodi",
  "passportNumber": "463024374"
}
```

#### Respostas
##### CREATED 201
Será retornado um _HATEOAS_, que é um array contendo as ações possíveis para o cliente cadastrado.

```json
{
  "_links": [
    {
      "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
      "method": "GET",
      "rel": "self_user"
    },
    {
      "href": "http://localhost:4000/users",
      "method": "PUT",
      "rel": "edit_user"
    },
    {
      "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
      "method": "DELETE",
      "rel": "delete_user"
    }
  ]
}
```

##### BAD REQUEST 400
Será retornado um _RestException_, contendo informações sobre os erros encontrados na estrutura e/
ou no preenchimento do formulário de cadastro.

```json
{
  "RestException": {
    "Code": "4;4",
    "Message": "O Email informado já foi cadastrado anteriormente;O CPF informado já está cadastrado",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/4;https://projetohotelparaiso.dev/docs/erros/4",
    "ErrorFields": [
      {
        "field": "iptEmail",
        "hasError": {
          "value": true,
          "type": 4,
          "error": "O Email informado já foi cadastrado anteriormente"
        }
      },
      {
        "field": "iptCPF",
        "hasError": {
          "value": true,
          "type": 4,
          "error": "O CPF informado já está cadastrado"
        }
      }
    ]
  }
}
```

### POST /login
Faz o login de um usuário.

#### Parâmetros

##### Body
email: Email de um usuário já cadastrado. Obrigatório;  
password: Senha do usuário cadastrado. Obrigatório.  

O exemplo abaixo é do corpo de uma requisição de login de um usuário cadastrado.

```json
{
  "email": "tobias@gmail.com",
  "password": "T1@odb7iaS&5S9a@1T2"
}
```

#### Respostas
##### OK 200
Será retornado o _token_ de acesso e também o _HATEOAS_, que é um array contendo as ações possíveis 
para o usuário.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZTdiZmY4YWU0ZmEyMGFlOGEzZDBhMCIsImVtYWlsIjoidG9iaWFzQGdtYWlsLmNvbSIsInJvbGUiOjQsImlhdCI6MTcwOTc0MDQyNSwiZXhwIjoxNzEwMzQ1MjI1fQ.AD-I5II22h8ArLXNBDhaj3BgieqYSPbaQLSuarnRtGc",
  "_links": [
    {
      "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
      "method": "GET",
      "rel": "self_user"
    },
    {
      "href": "http://localhost:4000/users",
      "method": "PUT",
      "rel": "edit_user"
    },
    {
      "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
      "method": "DELETE",
      "rel": "delete_user"
    },
    {
      "href": "http://localhost:4000/users",
      "method": "GET",
      "rel": "user_list"
    }
  ]
}
```

##### BAD REQUEST 400
Será retornado um _RestException_, contendo informações sobre os erros encontrados na estrutura e/
ou no preenchimento do formulário de login.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "O Email informado não está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptEmail",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "O Email informado não está cadastrado"
        }
      }
    ]
  }
}
```

### GET /users/:id
Faz a busca das informações do cliente que possui o ID informado.

O exemplo abaixo é de uma consulta já com o ID do cliente.
</users/65c41b52e22dc214b8853271>

#### Parâmetros
##### URL
id: ID do cliente. Obrigatório.

#### Respostas
##### OK 200
Será retornado as informações do cliente junto com o HATEOAS, que é um array contendo as ações 
possíveis para o mesmo.

```json
{
  "_id": "65e895d432a8650dfc58b72a",
  "address": {
    "country": "US",
    "state": "MT",
    "city": "Helena"
  },
  "name": "doricleide chagas",
  "email": "dori_chagas@yahoo.com",
  "phoneCode": "406",
  "phoneNumber": "4478000",
  "birthDate": "09/06/1985",
  "passportNumber": "329903747",
  "__v": 0,
  "_links": [
    {
      "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
      "method": "GET",
      "rel": "self_user"
    },
    {
      "href": "http://localhost:4000/users",
      "method": "PUT",
      "rel": "edit_user"
    },
    {
      "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
      "method": "DELETE",
      "rel": "delete_user"
    }
  ]
}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "5",
    "Message": "O usuário não está autorizado",
    "Status": "401",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/5"
  }
}
```

##### FORBIDDEN 403
O usuário _cliente_ está tentando acessar informações de outro usuário. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "6",
    "Message": "O usuário não está autenticado",
    "Status": "403",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/6"
  }
}
```

### GET /users
Faz a listagem de todos os clientes cadastrados.  

Para essa API, foi utilizado o sistema de paginação __offset__ e __limit__. Quando seus valores são 
suprimidos, eles assumem os valores padrões __0__ (offset) e __20__ (limit).

#### Parâmetros
N/A

#### Respostas
##### OK 200
Será retornado a propriedade __users__, que é um _array de usuários cadastrados_, e o __hasNext__, 
que é a propriedade _booleana_ que indica se há ou não uma próxima página. Cada elemento do array 
de usuários contém um _HATEOAS_ das ações possíveis com cada usuário.

```json
{
  "users": [
    {
      "_id": "65e7bff8ae4fa20ae8a3d0a0",
      "updated": {
        "updatedAt": "05/03/2024 20:59:36",
        "updatedBy": {}
      },
      "address": {
        "country": "BR",
        "state": "SP",
        "city": "São Paulo"
      },
      "created": {
        "createdAt": "05/03/2024 20:59:36",
        "createdBy": {}
      },
      "name": "tobias de oliveira",
      "email": "tobias@gmail.com",
      "role": 4,
      "phoneCode": "55",
      "phoneNumber": "11984752352",
      "birthDate": "09/06/1985",
      "cpf": "12112112112",
      "__v": 0,
      "_links": [
        {
          "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
          "method": "GET",
          "rel": "self_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "PUT",
          "rel": "edit_user"
        },
        {
          "href": "http://localhost:4000/users/65e7bff8ae4fa20ae8a3d0a0",
          "method": "DELETE",
          "rel": "delete_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "GET",
          "rel": "user_list"
        }
      ]
    },
    {
      "_id": "65e895d432a8650dfc58b72a",
      "updated": {
        "updatedAt": "06/03/2024 12:12:04",
        "updatedBy": {}
      },
      "address": {
        "country": "US",
        "state": "MT",
        "city": "Helena"
      },
      "created": {
        "createdAt": "06/03/2024 12:12:04",
        "createdBy": {}
      },
      "name": "doricleide chagas",
      "email": "dori_chagas@yahoo.com",
      "role": 0,
      "phoneCode": "406",
      "phoneNumber": "4478000",
      "birthDate": "09/06/1985",
      "passportNumber": "329903747",
      "__v": 0,
      "_links": [
        {
          "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
          "method": "GET",
          "rel": "self_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "PUT",
          "rel": "edit_user"
        },
        {
          "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
          "method": "DELETE",
          "rel": "delete_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "GET",
          "rel": "user_list"
        }
      ]
    }
  ],
  "hasNext": false
}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "5",
    "Message": "O usuário não está autorizado",
    "Status": "401",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/5"
  }
}
```

##### FORBIDDEN 403
O usuário _cliente_ não pode acessar a listagem de usuários. Será retornado um _RestException_ com 
mais informações.

```json
{
  "RestException": {
    "Code": "6",
    "Message": "O usuário não está autenticado",
    "Status": "403",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/6"
  }
}
```

### POST /users/search
Faz a busca de um usuário pela documentação informada (CPF ou Número do Passaporte).

#### Parâmetros
##### Body
cpf: _Número do CPF_ do usuário brasileiro. Condicional;  
passportNumber: _Número do passaporte_ do usuário estrangeiro. Condicional.  

Informar somente __um__ dos parâmetros acima.

#### Respostas
##### OK 200
Será retornado as informações do cliente junto com o HATEOAS, que é um array contendo as ações 
possíveis para o mesmo.

```json
{
  "users": [
    {
      "_id": "65e895d432a8650dfc58b72a",
      "updated": {
        "updatedAt": "06/03/2024 12:12:04",
        "updatedBy": {}
      },
      "address": {
        "country": "US",
        "state": "MT",
        "city": "Helena"
      },
      "created": {
        "createdAt": "06/03/2024 12:12:04",
        "createdBy": {}
      },
      "name": "doricleide chagas",
      "email": "dori_chagas@yahoo.com",
      "role": 0,
      "phoneCode": "406",
      "phoneNumber": "4478000",
      "birthDate": "09/06/1985",
      "passportNumber": "329903747",
      "__v": 0,
      "_links": [
        {
          "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
          "method": "GET",
          "rel": "self_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "PUT",
          "rel": "edit_user"
        },
        {
          "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
          "method": "DELETE",
          "rel": "delete_user"
        },
        {
          "href": "http://localhost:4000/users",
          "method": "GET",
          "rel": "user_list"
        }
      ]
    }
  ]
}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "5",
    "Message": "O Token é inválido",
    "Status": "401",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/5"
  }
}
```

##### FORBIDDEN 403
O usuário _cliente_ não pode acessar a listagem de usuários. Será retornado um _RestException_ com 
mais informações.

```json
{
  "RestException": {
    "Code": "6",
    "Message": "O usuário não está autenticado",
    "Status": "403",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/6"
  }
}
```

### PUT /users/:id
Faz a atualização de um usuário.

O exemplo abaixo é de um endpoint de atualização de usuário.
</users/65e895d432a8650dfc58b72a>

#### Parâmetros
##### URL
id: É o ID do usuário a ser atualizado. Obrigatório.

##### Body
name: Nome do cliente. Opcional;  
email: Email de contato do cliente. Opcional;  
password: Senha de acesso ao site. É necessário informar uma __senha forte__, favor verificar o 
método _isStrongPassword()_ da biblioteca Validator.js para a saber quais são os requisitos de uma 
senha forte. Opcional;  
phoneCode: Código do país do telefone do cliente. Opcional;  
phoneNumber: Telefone com o código do estado do cliente. Opcional;  
birthDate: Data de nascimento do cliente, no formato yyyy-mm-dd. Opcional;  
country: País de nascimento do cliente. Opcional;  
state: Estado de nascimento do cliente. Opcional;  
city: Cidade de nascimento do cliente. Opcional;  
cpf: CPF do cliente. Opcional/Condicional (somente para brasileiros);  
passportNumber: CPF do cliente. Opcional/Condicional (somente para estrangeiros);  

Exemplo de atualização do _nome_, _email_ e _data de nascimento_ de um usuário.
```json
{
  "name": "Dinorá Cruz",
  "email": "cruz@hotmail.com",
  "birthDate": "1999-06-09"
}
```

#### Respostas

##### OK 200
Será retornado o _HATEOAS_ do usuário que teve suas informações atualizadas.

```json
{
  "_links": [
    {
      "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
      "method": "GET",
      "rel": "self_user"
    },
    {
      "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
      "method": "PUT",
      "rel": "edit_user"
    },
    {
      "href": "http://localhost:4000/users/65e895d432a8650dfc58b72a",
      "method": "DELETE",
      "rel": "delete_user"
    }
  ]
}
```

#### BAD REQUEST 400
Será retornado um _RestException_, contendo informações sobre os erros encontrados na estrutura e/
ou no preenchimento do formulário de login.

```json
{
  "RestException": {
    "Code": "4",
    "Message": "O Email informado já foi cadastrado anteriormente",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/4",
    "ErrorFields": [
      {
        "field": "iptEmail",
        "hasError": {
          "value": true,
          "type": 4,
          "error": "O Email informado já foi cadastrado anteriormente"
        }
      }
    ]
  }
}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "5",
    "Message": "O usuário não está autorizado",
    "Status": "401",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/5"
  }
}
```

##### FORBIDDEN 403
O usuário _cliente_ não pode acessar a listagem de usuários. Será retornado um _RestException_ com 
mais informações.

```json
{
  "RestException": {
    "Code": "6",
    "Message": "O usuário não está autenticado",
    "Status": "403",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/6"
  }
}
```

### DELETE /users/:id
Faz a deleção de um usuário.

O exemplo abaixo é de um endpoint de deleção de usuário.
</users/65e895d432a8650dfc58b72a>

#### Parâmetros
##### URL
id: É o ID do usuário a ser deletado. Obrigatório.

#### Resultados
##### OK 200
Retorna um objeto JSON vazio.

```json
{}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um _
RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "5",
    "Message": "O Token é inválido",
    "Status": "401",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/5"
  }
}
```

##### FORBIDDEN 403
O usuário _cliente_ não pode deletar a conta de outro usuários. Será retornado um _RestException_
com mais informações.

```json
{
  "RestException": {
    "Code": "6",
    "Message": "O usuário não está autenticado",
    "Status": "403",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/6"
  }
}
```