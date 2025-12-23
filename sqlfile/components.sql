create table Nation(
    NationalityCode     VARCHAR(5)      NOT NULL PRIMARY KEY,
    NationName          VARCHAR(255)    NOT NULL
);

create table Bank(
    BankCode            VARCHAR(20)     NOT NULL PRIMARY KEY,
    BankName            VARCHAR(255)    NOT NULL
);

create table ClientInfo(
    AccountNumber       VARCHAR(20)     NOT NULL PRIMARY KEY,
    SocialNumber        INT             NOT Null UNIQUE,
    ClientName          VARCHAR(100)    NOT NULL,
    DateBirth           DATE            NOT NULL,
    NationalityCode     varCHAR(5)      NOT NULL,
    PhoneNumber         VARCHAR(15)     NOT NULL,
    Email               VARCHAR(100)    not NULL,
    ClientAddress       VARCHAR(255)    NOT NULL,
    BankCode            VARCHAR(20)     NOT NULL,
    Balance             INT             NOT NULL
);

create table TransactionInfo(
    TransactionNumber   VARCHAR(20)     NOT NULL PRIMARY KEY,
    SendBankNum         VARCHAR(20)     NOT NULL,
    SendNumber          VARCHAR(20)     NOT NULL,
    ReceiveBankNum      VARCHAR(20)     NOT NULL,
    ReceiveNumber       VARCHAR(20)     NOT NULL,
    MoneySend           INT             NOT NULL,
    TimeSend            DATETIME        not null,
    Note                VARCHAR(255)    
);



ALTER Table ClientInfo
    ADD constraint FK_ClientInfo_Bank                       FOREIGN KEY (BankCode)          REFERENCES Bank(BankCode),
    ADD constraint FK_ClientInfo_Nation                     FOREIGN KEY (NationalityCode)   REFERENCES Nation(NationalityCode);

ALTER Table TransactionInfo
    ADD constraint FK_Bank_Send_TransactionInfo             FOREIGN KEY (SendBankNum)       REFERENCES Bank(BankCode),
    ADD constraint FK_Bank_Receive_TransactionInfo          FOREIGN KEY (ReceiveBankNum)    REFERENCES Bank(BankCode),
    ADD constraint FK_ClientInfo_Send_TransactionInfo       FOREIGN KEY (SendNumber)        REFERENCES ClientInfo(AccountNumber),
    ADD constraint FK_ClientInfo_Receive_TransactionInfo    FOREIGN KEY (ReceiveNumber)     REFERENCES ClientInfo(AccountNumber);
