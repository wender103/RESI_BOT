Fazer o user colocar o indereço da moeda de modo que o bot vai checar se de fato aquele indereço é da moeda de fato, depois disso o bot vai salvar um Array 

Tokens [
    Token {
        ID: 'EQD6XFBqJ5h_DLugPPbBSrVO_lEczzZXJUNr8P9CB8cHzC7c',
        Canal: '23j4hhjkrj2h3jk',
        Jetton: {
            "address": "0:fa5c506a27987f0cbba03cf6c14ab54efe511ccf365725436bf0ff4207c707cc",
            "name": "Baby Lady",
            "symbol": "BBLady",
            "decimals": "9",
            "image": "https://cache.tonapi.io/imgproxy/MbOTtTF4IuTmaLuH_Z8Y7LMxuM_hhmPn4hq_jzFAaU4/rs:fill:200:200:1/g:no/aHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0dRSHE1c29iY0FBallzXz9mb3JtYXQ9anBnJm5hbWU9MzYweDM2MA.webp",
            "description": "One magical night at a concert, MAN was captivated by a girl’s enchanting gaze. Drawn together, they shared a dance and formed a deep, intimate bond under the stars. From their passion, Baby Lady was born—a token blending the elegance of Lady Token and the strength of Gentlemen Token.  Tele: https://t.me/Babyladyonton Website: http://babyladyton.xyz X: https://x.com/BabyLadyTon"
        },
        LastTransaction: 'EQAgiIMEQRJroJop2K2tBCGzHrpW7Zlzm3F-1okpkbUvb_OT',
        Holders: [
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
            {ID: 'EQB-TGu5NjcdlOLEAaU-NEo9n6FKd8E_zG022DvRb8eyYptU'},
        ]
    }
]

Para analizar as ultimas transações de cada Holder, colocando-as em um Array, no qual ele vai checar qual indice equivale ao hast da LastTransaction de modo a logar todas as ultimas transações após o LastTransaction.