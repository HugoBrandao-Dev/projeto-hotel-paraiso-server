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
* Dentro do analyzer, impedir que dados não validados sejam utilizados em consultas nos Models. 
Por exemplo, no analisador de CPF a busca por usuário que possui o CPF é feita _antes de outras 
validações, como ser ou não um inteiro e possuir exatos 11 caracteres_;
* Retirar o código, no cadastro de um usuário, que torna o _primeiro usuário_ a se cadastrar um 
Admin, fazendo com que _cargo (role)_ do usuário seja alterado diretamente no Banco de Dados;
* Integrar a API com a __AWS (Amazon Web Service)__, para que as imagens dos apartamentos sejam 
armazenadas na nuvem, e também com o __Redis__, para que a sessão/token do usuário seja armazenada;
* Concluir a criação de todos os testes com o _Jest_, já que tive que parar de utilizá-lo (
codificá-lo) devido ao tempo de conclusão de todos os testes (meu computador é muito lento) e 
possível "incompatibilidade" (tempo de resposta) com o MongoDB Atlas;
* Impedir que clientes menores de idade se cadastrem ou sejam cadastrados;
* Impedir que sejam retornados HTML em erros do tipo 500 (Internal Server Error);
* No login de um cliente, validar a senha depois de já ter avaliado o email;
* Unificar estrutura d cadastro de uma apartamento com e sem imagens;
* Para endpoints que requerem autorização ou autenticação, verificar o token __primeiro__ (antes 
de qual outro processo);
* Emitir erro (404) em todas as rotas de busca, atualização e deleção de um documento que não 
existe;
* Revisar caracteres permitidos nos inputs, para impedir ataques em campos de entrada.

## Bug(s)
* Impedir que uma mesma propriedade seja setada duas vezes;
* Impedir que propriedades que se "anulam" sejam informadas juntas (Ex.: cpf anula o número do 
passaporte, no cadastro ou atualização de um cliente);
* Na rota de busca por usuários através de seu documento (CPF ou Número de Passaporte) está 
retornando a lista completa de usuário, quando não encontra um valor exato ao informado;
* Quando um token de Admin expirado é usado para criação de conta, está retornando erro 500;
* Impedir que a diária seja alterada, se o apartamento já estiver reservado/ocupado;
* Impedir que um apartamento _reservado_ ou _ocupado_ seja deletado;
* Se o cliente atualizar somente a _data de termino_ de uma reserva, verificar se a data informada 
é anterior a data de início armazenada.

## Informações adicionais
### Jest e o this dos métodos de uma rota
* Métodos, que são usados para atender uma rota, como é o caso do create do UserController, não 
conseguem reconhecer o this de sua classe, sendo impossível chamar outros métodos da mesma.

## Endpoints

A maioria dos parâmetros são avaliados utilizando métodos da biblioteca [Validator.js](https://github.com/validatorjs/validator.js).

### POST /users
Cadastra um cliente.

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
Será retornado o _token_ de acesso e também o _HATEOAS_, que é um array contendo as ações 
possíveis para o usuário.

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
<http://localhost:4000/users/65c41b52e22dc214b8853271>

#### Parâmetros
##### URL
\* São obrigatórios
Parâmetro | Descrição
----------|----------
id*       | ID do cliente.

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
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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

Para essa API, foi utilizado o sistema de paginação __offset__ e __limit__. Quando seus valores 
são suprimidos, eles assumem os valores padrões __0__ (offset) e __20__ (limit).

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
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
<http://localhost:4000/users/65e895d432a8650dfc58b72a>

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
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
<http://localhost:4000/users/65e895d432a8650dfc58b72a>

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
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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

### POST /apartments
Cadastra um novo apartamento.

#### Parâmetros
##### Body

###### Sem imagens
floor: O piso em que o apartamento fica. Obrigatório;  
number: Número do apartamento. Obrigatório;  
rooms: Cômodos que o apartamento possui. Obrigatório;  
* room: Nome do cômodo. Obrigatório;  
* quantity: Quantidade do cômodo em questão. Obrigatório.  
accepts_animals: Indica se o apartamento pode ou não receber animais. Obrigatório;  
daily_price: Diária do apartamento. Obrigatório.  

O exemplo abaixo é do corpo de uma requisição de cadastro de um apartamento.
```json
{
  "floor": "1",
  "number": "1",
  "rooms": [
    {
      "room": "sala de estar",
      "quantity": "1"
    },
    {
      "room": "cozinha",
      "quantity": "1"
    },
    {
      "room": "banheiro",
      "quantity": "1"
    },
    {
      "room": "quarto",
      "quantity": "1"
    }
  ],
  "accepts_animals": "0",
  "daily_price": "250"
}
```

###### Com imagens
apartment: Guarda todas as informações descritivas do apartamento. Obrigatório;
* floor: O piso em que o apartamento fica. Obrigatório;  
* number: Número do apartamento. Obrigatório;  
* rooms: Cômodos que o apartamento possui. Obrigatório;  
+ room: Nome do cômodo. Obrigatório;  
+ quantity: Quantidade do cômodo em questão. Obrigatório.  
* accepts_animals: Indica se o apartamento pode ou não receber animais. Obrigatório;  
* daily_price: Diária do apartamento. Obrigatório.  
iptImages: Imagens do apartamento. Condicional.

#### Respostas
##### CREATED 201
Será retornado o _HATEOAS_ com as ações possíveis com o apartamento criado.

```json
{
  "_links": [
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "GET",
      "rel": "self_apartment"
    },
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "PUT",
      "rel": "edit_apartment"
    },
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "DELETE",
      "rel": "delete_apartment"
    },
    {
      "href": "http://localhost:4000/apartments",
      "method": "GET",
      "rel": "apartment_list"
    }
  ]
}
```

##### 400 BAD REQUEST
Será retornado um _RestException_, contendo informações sobre os erros encontrados na estrutura e/
ou no preenchimento do formulário de login.

```json
{
  "RestException": {
    "Code": "4",
    "Message": "O Número do Apartamento já está cadastrado",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/4",
    "ErrorFields": [
      {
        "field": "iptNumber",
        "hasError": {
          "value": true,
          "type": 4,
          "error": "O Número do Apartamento já está cadastrado"
        }
      }
    ]
  }
}
```

##### UNAUTHORIZED 401
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário não tem permissão acesso a esse endpoint.

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

### GET /apartments/:id
Faz a busca por informações de um apartamento em específicio.

O exemplo abaixo é de um endpoint de leitura de um apartamento.  
<http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c>

#### Parâmetros
##### URL
id: É o ID do apartamento. Obrigatório.

#### Respostas
##### OK 200
Será retornado as informações do apartamento junto com o HATEOAS, que é um array contendo as ações 
possíveis para o mesmo.

```json
{
  "_id": "65e9fd9ffeeb4c158878f95c",
  "reserve": {
    "status": "livre"
  },
  "updated": {
    "updatedAt": "07/03/2024 13:47:11",
    "updatedBy": {}
  },
  "created": {
    "createdBy": {
      "id": "65e7bff8ae4fa20ae8a3d0a0",
      "name": "tobias de oliveira"
    },
    "createdAt": "07/03/2024 13:47:11"
  },
  "floor": "1",
  "number": "1",
  "rooms": [
    {
      "room": "sala de estar",
      "quantity": 1
    },
    {
      "room": "cozinha",
      "quantity": 1
    },
    {
      "room": "banheiro",
      "quantity": 1
    },
    {
      "room": "quarto",
      "quantity": 1
    }
  ],
  "daily_price": 250,
  "accepts_animals": false,
  "__v": 0,
  "pictures": [],
  "_links": [
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "GET",
      "rel": "self_apartment"
    },
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "PUT",
      "rel": "edit_apartment"
    },
    {
      "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
      "method": "DELETE",
      "rel": "delete_apartment"
    },
    {
      "href": "http://localhost:4000/apartments",
      "method": "GET",
      "rel": "apartment_list"
    }
  ]
}
```

##### FORBIDDEN 403
O usuário _cliente_ não pode acessar informações de um apartamento reservado por outro cliente. 
Será retornado um _RestException_ com mais informações.

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

### GET /apartments
Faz a listagem de todos os clientes cadastrados.

#### Parâmetros
##### Query String
rooms: Quantidade de cômodos. Opcional;  
lowest_daily_price: Menor valor da diária. Opcional;  
highest_daily_price: Maior valor da diária. Opcional;  
accepts_animals: Aceita o não animais no apartamento. Opcional;  
offset: A partir da qual posição serão retornados os resultados. Opcional;  
limit:2: Quantidade máxima de apartamentos a serem retornados. Opcional;  
sort: Ordenação do valores. Por enquanto, só há ordenação do _valor da diária (daily_price)_, 
podendo ser _asc_ ou _desc_. Opcional.  

Para essa API, foi utilizado o sistema de paginação __offset__ e __limit__. Quando seus valores 
são suprimidos, eles assumem os valores padrões __0__ (offset) e __20__ (limit).

O exemplo abaixo é da URL de uma consulta __limpa__.  
<http://localhost:4000/apartments>  

O exemplo abaixo é da URL de uma consulta com __Query String__.  
<http://localhost:4000/apartments?rooms=7&lowest_daily_price=300&highest_daily_price=750&accepts_animals=1&offset=1&limit=2&sort=daily_price:desc>

#### Respostas
##### OK 200
Será retornado a propriedade __apartments__, que é um _array com apartamentos livres_, e o 
__hasNext__, que é a propriedade _booleana_ que indica se há ou não uma próxima página. Cada 
elemento do array de apartamentos contém um _HATEOAS_ das ações possíveis com cada apartamento.

```json
{
  "apartments": [
    {
      "_id": "65e9fd9ffeeb4c158878f95c",
      "floor": "1",
      "number": "1",
      "rooms": [
        {
          "room": "sala de estar",
          "quantity": 1
        },
        {
          "room": "cozinha",
          "quantity": 1
        },
        {
          "room": "banheiro",
          "quantity": 1
        },
        {
          "room": "quarto",
          "quantity": 1
        }
      ],
      "daily_price": 250,
      "accepts_animals": false,
      "__v": 0,
      "pictures": [],
      "_links": [
        {
          "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
          "method": "GET",
          "rel": "self_apartment"
        },
        {
          "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
          "method": "PUT",
          "rel": "edit_apartment"
        },
        {
          "href": "http://localhost:4000/apartments/65e9fd9ffeeb4c158878f95c",
          "method": "DELETE",
          "rel": "delete_apartment"
        }
      ]
    }
  ],
  "hasNext": false
}
```

##### FORBIDDEN 403
Apesar do endpoint ser livre, se o cliente estiver acessando-o com um token inválido, ele não está 
autenticado. Será retornado um _RestException_ com mais informações.

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

### PUT /apartments/:id
Faz a atualização de um apartamentos.

O exemplo abaixo é de um endpoint de atualização de apartamento.  
<http://localhost:4000/apartments/65ea32804f7d6e0acce3f411>

#### Parâmetros
##### URL
id: ID do apartamento a ser atualizado. Obrigatório.  

##### Body
###### Sem imagens
floor: O piso em que o apartamento fica. Opcional;  
number: Número do apartamento. Opcional;  
rooms: Cômodos que o apartamento possui. Opcional;  
* room: Nome do cômodo. Opcional;  
* quantity: Quantidade do cômodo em questão. Opcional.  
accepts_animals: Indica se o apartamento pode ou não receber animais. Opcional;  
daily_price: Diária do apartamento. Opcional.  

O exemplo abaixo é do corpo de uma requisição de cadastro de um apartamento.
```json
{
  "floor": 1,
  "daily_price": 999.90
}
```

###### Com imagens
apartment: Guarda todas as informações descritivas do apartamento. Opcional/Condicional;
* floor: O piso em que o apartamento fica. Opcional;  
* number: Número do apartamento. Opcional;  
* rooms: Cômodos que o apartamento possui. Opcional;  
+ room: Nome do cômodo. Opcional;  
+ quantity: Quantidade do cômodo em questão. Opcional.  
* picturesToBeDeleted: Imagens (IDs/Hashs das imagens) que serão deletadas. Opcional;  
* accepts_animals: Indica se o apartamento pode ou não receber animais. Opcional;  
* daily_price: Diária do apartamento. Opcional.  
iptImages: Imagens do apartamento. Opcional/Condicional.

#### Respostas
##### OK 200

##### BAD REQUEST 400
Será retornado um _RestException_, contendo informações sobre os erros encontrados na estrutura e/
ou no preenchimento do formulário de atualização do apartamento.

```json
{
  "RestException": {
    "Code": "2",
    "Message": "O valor da diária é inválido",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/2",
    "ErrorFields": [
      {
        "field": "iptDailyPrice",
        "hasError": {
          "value": true,
          "type": 2,
          "error": "O valor da diária é inválido"
        }
      }
    ]
  }
}
```

##### UNAUTHORIZED 401
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário _cliente_ não pode atualizar as informações de um apartamento. Será retornado um 
_RestException_ com mais informações.

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

##### NOT FOUND 404
Retorna um _RestException_ com mais informações do error.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "Nenhum apartamento com o ID informado está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptApartment",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "Nenhum apartamento com o ID informado está cadastrado"
        }
      }
    ]
  }
}
```

### DELETE /apartments/:id
Faz a deleção de um apartamento.

O exemplo abaixo é de um endpoint de deleção de apartamento.  
<http://localhost:4000/apartments/65ea1dd64f7d6e0acce3f3fa>

#### Parâmetros
##### URL
id: ID do apartamento a ser deletado. Obrigatório.

#### Respostas
##### OK 200
Retorna um objeto JSON vazio.

```json
{}
```

##### UNAUTHORIZED 401
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário está tentando deletar um apartamento sem ter os privilégios para isso. Será retornado um 
_RestException_ com mais informações.

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

##### NOT FOUND 404
Não existe um apartamento com o ID informado. Será retornado um _RestException_ com mais 
informações.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "Nenhum apartamento com o ID informado está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptApartment",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "Nenhum apartamento com o ID informado está cadastrado"
        }
      }
    ]
  }
}
```

### POST /reserves
Faz o cadastro de uma nova reserva.

#### Parâmetros
##### Body
apartment_id: ID do apartamento a ser reservado. Obrigatório;  
status: Novo status que o apartamento terá. Condicinal;  
client_id: ID do cliente ao qual o apartamento foi reservado. Condicional;  
start: Data de início da reserva. Obrigatório;  
end: Data de término da reserva. Obrigatório.

O exemplo abaixo é do corpo de uma requisição de cadastro de uma reserva.
```json
{
  "status": "reservado",
  "client_id": "65ea22194f7d6e0acce3f407",
  "start": "2024-10-10",
  "end": "2024-10-15"
}
```

#### Respostas
##### CREATED 201
Será retornado o _HATEOAS_, que é um array contendo as ações possíveis para a reserva feita.

```json
{
  "_links": [
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "GET",
      "rel": "self_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "PUT",
      "rel": "edit_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "DELETE",
      "rel": "delete_reserve"
    },
    {
      "href": "http://localhost:4000/reserves",
      "method": "GET",
      "rel": "reserve_list"
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
    "Code": "2",
    "Message": "O valor do campo de Status é inválido",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/2",
    "ErrorFields": [
      {
        "field": "iptStatus",
        "hasError": {
          "value": true,
          "type": 2,
          "error": "O valor do campo de Status é inválido"
        }
      }
    ]
  }
}
```

##### UNAUTHORIZED 401
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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

##### NOT FOUND 404
Não existe um apartamento com o ID informado ou um não existe um cliente com o ID informado. Será 
retornado um _RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "Nenhum apartamento com o ID informado está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptApartment",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "Nenhum apartamento com o ID informado está cadastrado"
        }
      }
    ]
  }
}
```

### GET /reserves/:id
Faz a busca por informações de uma reserva.

O exemplo abaixo é de um endpoint de _reserva_ de um apartamento.  
<http://localhost:4000/apartments/65ea1dd64f7d6e0acce3f3fa>

#### Parâmetros
##### URL
id: ID do _apartamento_ no qual se quer buscar as informações da reserva. Obrigatório.

#### Respostas
##### OK 200
Será retornado as informações da reserva junto com o HATEOAS, que é um array contendo as ações 
possíveis para a mesma.

```json
{
  "_id": "65ea32804f7d6e0acce3f411",
  "reserve": {
    "status": "reservado",
    "start": "10/10/2024",
    "end": "15/10/2024",
    "reserved": {
      "reservedAt": "2024-03-08T13:52:19.412Z",
      "RESERVED_BY": [
        {
          "_id": "65e7bff8ae4fa20ae8a3d0a0",
          "name": "tobias de oliveira"
        }
      ]
    },
    "CLIENT_ID": [
      {
        "_id": "65ea22194f7d6e0acce3f407",
        "name": "dinorá de oliveira"
      }
    ]
  },
  "_links": [
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "GET",
      "rel": "self_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "PUT",
      "rel": "edit_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
      "method": "DELETE",
      "rel": "delete_reserve"
    },
    {
      "href": "http://localhost:4000/reserves",
      "method": "GET",
      "rel": "reserve_list"
    }
  ]
}
```

##### UNAUTHORIZED 401
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário está tentando ler as informações de uma reserva sem ter os privilégios para isso. Será 
retornado um _RestException_ com mais informações.

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

##### NOT FOUND 404
Está se tentando buscar uma reserva de um apartamento que não existe. Será retornado um 
_RestException_ com mais informações.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "Nenhum apartamento com o ID informado está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptApartment",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "Nenhum apartamento com o ID informado está cadastrado"
        }
      }
    ]
  }
}
```

### GET /reservas
Lista todas as informações de todas as reservas.

#### Parâmetros
##### Query String
offset: A partir da qual posição serão retornados os resultados. Opcional;  
limit: Quantidade máxima de reservas a serem retornados. Opcional.  

Para essa API, foi utilizado o sistema de paginação __offset__ e __limit__. Quando seus valores 
são suprimidos, eles assumem os valores padrões __0__ (offset) e __20__ (limit).

#### Respostas
##### OK 200
Será retornado a propriedade __reserves__, que é um _array das reservas_, e o __hasNext__, que é a 
propriedade _booleana_ que indica se há ou não uma próxima página. Cada elemento do array de 
reservas contém um _HATEOAS_ das ações possíveis com cada reserva.

```json
{
  "reserves": [
    {
      "_id": "65ea32804f7d6e0acce3f411",
      "reserve": {
        "status": "reservado",
        "start": "10/10/2024",
        "end": "15/10/2024",
        "reserved": {
          "reservedAt": "08/03/2024 09:52:19",
          "RESERVED_BY": [
            {
              "_id": "65e7bff8ae4fa20ae8a3d0a0",
              "name": "tobias de oliveira"
            }
          ]
        },
        "CLIENT_ID": [
          {
            "_id": "65ea22194f7d6e0acce3f407",
            "name": "dinorá de oliveira"
          }
        ]
      },
      "_links": [
        {
          "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
          "method": "GET",
          "rel": "self_reserve"
        },
        {
          "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
          "method": "PUT",
          "rel": "edit_reserve"
        },
        {
          "href": "http://localhost:4000/reserves/65ea32804f7d6e0acce3f411",
          "method": "DELETE",
          "rel": "delete_reserve"
        },
        {
          "href": "http://localhost:4000/reserves",
          "method": "GET",
          "rel": "reserve_list"
        }
      ]
    },
    {
      "_id": "65eb4045dff65f114c0718d6",
      "reserve": {
        "status": "reservado",
        "start": "10/10/2024",
        "end": "15/10/2024",
        "reserved": {
          "reservedAt": "08/03/2024 09:52:19",
          "RESERVED_BY": [
            {
              "_id": "65e7bff8ae4fa20ae8a3d0a0",
              "name": "tobias de oliveira"
            }
          ]
        },
        "CLIENT_ID": [
          {
            "_id": "65ea1e264f7d6e0acce3f3ff",
            "name": "doricleide chagas"
          }
        ]
      },
      "_links": [
        {
          "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
          "method": "GET",
          "rel": "self_reserve"
        },
        {
          "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
          "method": "PUT",
          "rel": "edit_reserve"
        },
        {
          "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
          "method": "DELETE",
          "rel": "delete_reserve"
        },
        {
          "href": "http://localhost:4000/reserves",
          "method": "GET",
          "rel": "reserve_list"
        }
      ]
    }
  ],
  "hasNext": false
}
```

##### 401 UNAUTHORIZED
O usuário está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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

### PUT /reserves/:id
Atualiza as informações de uma reserva.

#### Parâmetros
##### URL
id: ID do apartamento que terá sua reserva atualizada;  

##### Body
status: Novo status que o apartamento terá. Opcional e Condicinal;  
client_id: ID do cliente ao qual o apartamento foi reservado. Opcional e Condicional;  
start: Data de início da reserva. Opcional;  
end: Data de término da reserva. Opcional.

Exemplo de atualização do _nome_, _email_ e _data de nascimento_ de um usuário.
```json
{
  "status": "ocupado",
  "start": "2024-05-02",
  "end": "2024-05-10"
}
```

#### Respostas
##### OK 200
Será retornado o _HATEOAS_ do apartamento que teve suas informações de reserva atualizadas.

```json
{
  "_links": [
    {
      "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
      "method": "GET",
      "rel": "self_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
      "method": "PUT",
      "rel": "edit_reserve"
    },
    {
      "href": "http://localhost:4000/reserves/65eb4045dff65f114c0718d6",
      "method": "DELETE",
      "rel": "delete_reserve"
    },
    {
      "href": "http://localhost:4000/reserves",
      "method": "GET",
      "rel": "reserve_list"
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
    "Code": "2",
    "Message": "O valor do campo de Status é inválido",
    "Status": "400",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/2",
    "ErrorFields": [
      {
        "field": "iptStatus",
        "hasError": {
          "value": true,
          "type": 2,
          "error": "O valor do campo de Status é inválido"
        }
      }
    ]
  }
}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário não tem privilégio suficiente a realizar tal atualização. Será retornado um 
_RestException_ com mais informações.

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

##### NOT FOUND 404
O apartamento que se está tentando atualizar não existe. Será retornado um _RestException_ com 
mais informações.

```json
{
  "RestException": {
    "Code": "3",
    "Message": "Nenhum apartamento com o ID informado está cadastrado",
    "Status": "404",
    "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
    "ErrorFields": [
      {
        "field": "iptApartment",
        "hasError": {
          "value": true,
          "type": 3,
          "error": "Nenhum apartamento com o ID informado está cadastrado"
        }
      }
    ]
  }
}
```

### DELETE /reserves/:id
Faz a deleção/cancelamento da reserva de um apartamento.

#### Parâmetros
##### URL
id: ID do apartamento que terá sua reserva deletada/cancelada.

#### Respostas
##### OK 200
Retorna um objeto JSON vazio.

```json
{}
```

##### UNAUTHORIZED 401
O cliente está tentando acessar esse endpoint sem um _token_ ou com um inválido. Será retornado um 
_RestException_ com mais informações.

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
O usuário não tem privilégio suficiente para deletar a reserva. Será retornado um _RestException_
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

##### NOT FOUND 404


```json
{
    "RestException": {
        "Code": "3",
        "Message": "Nenhum apartamento com o ID informado está cadastrado",
        "Status": "404",
        "MoreInfo": "https://projetohotelparaiso.dev/docs/erros/3",
        "ErrorFields": [
            {
                "field": "iptApartment",
                "hasError": {
                    "value": true,
                    "type": 3,
                    "error": "Nenhum apartamento com o ID informado está cadastrado"
                }
            }
        ]
    }
}
```
