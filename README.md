## Instalação

```bash
$ npm install
# e
$ docker-compose build
```

Certifique-se de ter o Node.js e o Docker instalados antes de prosseguir com a instalação.

## Rodando o App

```bash
$ docker-compose up
# ou, para rodar em segundo plano
$ docker-compose up -d
```

## Testes

Para executar os testes unitários:

```bash
$ npm run test
```

## Rotas

[Rotas configuradas](https://drive.google.com/file/d/1VATOSaX3jOXTt5OhH5C4Hb3DPUlpFoPm/view?usp=sharing)

Devido o uso do docker, demora um pouco para iniciar(leva entre 3-5min). Tem uma rota configurada "STATUS" para verificar se a aplicação já esta on.


## Importação de Dados

Quando a API estiver em execução, existe uma rota de importação configurada para receber arquivos JSON via formulário multipart. Para iniciar a importação, siga estes passos:

1. Acesse a rota de importação no Insomnia ou Postman.
2. Use um formulário de envio com uma variável `file`.
3. Anexe o arquivo `.json` desejado.
4. Envie o formulário para iniciar a importação dos dados.