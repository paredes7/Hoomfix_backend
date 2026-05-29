%%{init: {'theme': 'dark'}}%%
erDiagram

  %% ─── CATÁLOGOS ───────────────────────────────────────────────

  Country {
    string  iso       PK
    string  dialCode
    string  name
    string  currency
    boolean active
  }

  ServiceType {
    string  id        PK
    string  name
    string  icon
    string  description
    boolean active
  }

  Package {
    string  id        PK
    string  name
    float   amountUsd
    boolean active
  }

  ExchangeRate {
    string  id           PK
    string  fromCurrency
    string  toCurrency
    float   rate
  }

  SystemConfig {
    string  id              PK
    float   commissionRate
    int     maxConcurrentJobs
  }

  %% ─── USUARIOS ────────────────────────────────────────────────

  User {
    string    id                  PK
    string    email
    string    username
    string    password
    Role      role
    boolean   isActive
    string    fcmToken
    datetime  createdAt
  }

  ClientProfile {
    string    id             PK
    string    userId         FK
    string    countryIso     FK
    string    firstName
    string    lastName
    string    avatar
    string    referralCode
    datetime  lastLoginAt
  }

  ProviderProfile {
    string    id             PK
    string    userId         FK
    string    countryIso     FK
    string    firstName
    string    lastName
    string    avatar
    string    referralCode
    datetime  lastLoginAt
  }

  Contact {
    string  id              PK
    string  clientProfileId FK
    string  phone
  }

  ProviderContact {
    string  id                PK
    string  providerServiceId FK
    string  phone
  }

  %% ─── ESPECIALIDADES ──────────────────────────────────────────

  ProviderService {
    string         id            PK
    string         userId        FK
    string         serviceTypeId FK
    string         countryIso    FK
    ProviderStatus status
    boolean        available
    float          rating
    int            totalRatings
    float          latitude
    float          longitude
  }

  ProviderServiceProfile {
    string  id                   PK
    string  providerServiceId    FK
    string  bio
    int     experience
    float   coverageRadius
    string  commercialName
    string  customServiceName
    string  servicePhoto
  }

  ProviderDocument {
    string  id                PK
    string  providerServiceId FK
    string  url
    string  publicId
    string  name
  }

  %% ─── WALLETS ─────────────────────────────────────────────────

  ClientWallet {
    string  id              PK
    string  clientProfileId FK
    string  currency
    float   balance
  }

  ProviderWallet {
    string  id                PK
    string  providerServiceId FK
    string  currency
    float   balance
  }

  %% ─── TRANSACCIONES ───────────────────────────────────────────

  Recharge {
    string         id             PK
    string         clientWalletId FK
    string         packageId      FK
    RechargeStatus status
  }

  ProviderPurchase {
    string         id               PK
    string         providerWalletId FK
    string         packageId        FK
    RechargeStatus status
  }

  Withdrawal {
    string           id               PK
    string           providerWalletId FK
    float            amount
    string           bankName
    string           accountNumber
    WithdrawalStatus status
  }

  %% ─── CONTENIDO DEL PROVIDER ──────────────────────────────────

  History {
    string    id                PK
    string    providerServiceId FK
    string    mediaUrl
    string    mediaPublicId
    MediaType mediaType
    string    caption
    datetime  expiresAt
  }

  HistoryView {
    string    id        PK
    string    historyId FK
    string    userId    FK
    datetime  viewedAt
  }

  Post {
    string    id                PK
    string    providerServiceId FK
    string    content
  }

  PostMedia {
    string    id            PK
    string    postId        FK
    string    mediaUrl
    string    mediaPublicId
    MediaType mediaType
    int       order
  }

  PostLike {
    string    id        PK
    string    postId    FK
    string    userId    FK
    datetime  createdAt
  }

  PostComment {
    string    id        PK
    string    postId    FK
    string    userId    FK
    string    content
  }

  SavedPost {
    string    id        PK
    string    userId    FK
    string    postId    FK
    datetime  createdAt
  }

  Reel {
    string    id                PK
    string    providerServiceId FK
    string    videoUrl
    string    videoPublicId
    string    thumbnailUrl
    string    thumbnailPublicId
    string    caption
    int       duration
    int       views
  }

  ReelLike {
    string    id        PK
    string    reelId    FK
    string    userId    FK
    datetime  createdAt
  }

  ReelComment {
    string    id        PK
    string    reelId    FK
    string    userId    FK
    string    content
  }

  SavedProvider {
    string    id                PK
    string    clientId          FK
    string    providerServiceId FK
    datetime  createdAt
  }

  Anuncio {
    string    id                PK
    string    providerWalletId  FK
    string    providerServiceId FK
    string    title
    string    description
    string    mediaUrl
    MediaType mediaType
    float     budget
    datetime  startDate
    datetime  endDate
    boolean   active
    int       impressions
    int       clicks
  }

  %% ─── SERVICIO CORE ───────────────────────────────────────────

  Service {
    string        id                PK
    string        clientId          FK
    string        providerServiceId FK
    string        serviceTypeId     FK
    string        description
    string        address
    float         latitude
    float         longitude
    ServiceStatus status
    float         price
    float         commission
  }

  Message {
    string      id        PK
    string      serviceId FK
    string      senderId  FK
    string      content
    MessageType type
    boolean     read
  }

  Call {
    string     id         PK
    string     serviceId  FK
    string     callerId   FK
    string     receiverId FK
    CallType   type
    CallStatus status
    datetime   startedAt
    datetime   endedAt
    int        duration
  }

  Rating {
    string  id        PK
    string  serviceId FK
    string  clientId  FK
    int     score
    string  comment
  }

  %% ─── RELACIONES ──────────────────────────────────────────────

  %% País
  Country         ||--o{ ClientProfile          : "registra clientes"
  Country         ||--o{ ProviderProfile        : "registra providers"
  Country         ||--o{ ProviderService        : "define moneda wallet"

  %% Usuario
  User            ||--o| ClientProfile          : "tiene perfil cliente"
  User            ||--o| ProviderProfile        : "tiene perfil provider"
  User            ||--o{ ProviderService        : "tiene especialidades"
  User            ||--o{ Service                : "solicita servicios"
  User            ||--o{ Message                : "envía mensajes"
  User            ||--o{ Rating                 : "da calificaciones"
  User            ||--o{ HistoryView            : "ve historias"
  User            ||--o{ SavedProvider          : "guarda providers"
  User            ||--o{ SavedPost              : "guarda publicaciones"
  User            ||--o{ PostLike               : "da likes a posts"
  User            ||--o{ PostComment            : "comenta en posts"
  User            ||--o{ ReelLike               : "da likes a reels"
  User            ||--o{ ReelComment            : "comenta en reels"

  %% Perfil cliente
  ClientProfile   ||--o| ClientWallet           : "tiene wallet"
  ClientProfile   ||--o{ Contact                : "tiene teléfonos"

  %% Especialidad provider
  ServiceType     ||--o{ ProviderService        : "categoriza"
  ServiceType     ||--o{ Service                : "categoriza"
  ProviderService ||--o| ProviderWallet         : "tiene wallet"
  ProviderService ||--o| ProviderServiceProfile : "tiene perfil público"
  ProviderService ||--o{ ProviderDocument       : "tiene documentos"
  ProviderService ||--o{ ProviderContact        : "tiene teléfonos"
  ProviderService ||--o{ Service                : "atiende servicios"
  ProviderService ||--o{ History                : "publica historias"
  ProviderService ||--o{ Post                   : "publica posts"
  ProviderService ||--o{ Reel                   : "publica reels"
  ProviderService ||--o{ Anuncio                : "tiene anuncios"
  ProviderService ||--o{ SavedProvider          : "guardado por usuarios"

  %% Contenido
  History         ||--o{ HistoryView            : "tiene vistas"
  Post            ||--o{ PostMedia              : "tiene media"
  Post            ||--o{ PostLike               : "tiene likes"
  Post            ||--o{ PostComment            : "tiene comentarios"
  Post            ||--o{ SavedPost              : "guardado por usuarios"
  Reel            ||--o{ ReelLike               : "tiene likes"
  Reel            ||--o{ ReelComment            : "tiene comentarios"

  %% Transacciones
  ClientWallet    ||--o{ Recharge               : "historial recargas"
  ProviderWallet  ||--o{ ProviderPurchase       : "historial compras"
  ProviderWallet  ||--o{ Withdrawal             : "historial retiros"
  ProviderWallet  ||--o{ Anuncio                : "financia anuncios"
  Package         ||--o{ Recharge               : "usado en recargas"
  Package         ||--o{ ProviderPurchase       : "usado en compras"

  %% Servicio
  Service         ||--o{ Message                : "tiene chat"
  Service         ||--o{ Call                   : "tiene llamadas"
  Service         ||--o| Rating                 : "tiene calificación"
