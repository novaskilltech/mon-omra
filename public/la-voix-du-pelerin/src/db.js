// Database & State Management (La Voix du Pèlerin)
// Seeds default data in LocalStorage if empty. Ready to be replaced by Firebase Firestore.

const SEED_ARTICLES = [
  {
    id: "art-1",
    title: "Comment bien se préparer spirituellement avant le départ",
    summary: "La Omra est avant tout un voyage du cœur. Découvrez les étapes clés pour purifier votre intention (Niyyah), vous repentir et vous préparer mentalement aux épreuves bénies de ce voyage.",
    category: "Avant le départ",
    content: `<h3>Introduction à la dimension spirituelle de la Omra</h3>
<p>Entreprendre la Omra, le petit pèlerinage, est une réponse à une invitation divine. Ce voyage n'est semblable à aucun autre : il ne s'agit pas de vacances ou d'une simple découverte culturelle, mais d'une migration physique et spirituelle vers la Maison d'Allah (Al-Haram). Pour que ce voyage transforme durablement votre vie, la préparation du cœur doit débuter bien avant de monter dans l'avion. En purifiant vos motivations, en vous réconciliant avec votre entourage et en fortifiant votre foi, vous maximisez les chances que vos rites soient acceptés (Omra Mabroura).</p>

<h3>1. La purification de l'intention (Al-Niyyah et Al-Ikhlas)</h3>
<p>L'intention est le pilier invisible mais fondamental de toute action en Islam. Posez-vous sincèrement la question : "Pourquoi est-ce que je pars en Omra ?" Est-ce pour acquérir un prestige social, pour publier des photos sur les réseaux sociaux, ou uniquement pour plaire à Allah (Soubhana wa Ta'ala) et rechercher Son pardon ? L'ostentation (Al-Riya) est un piège subtil. Renouvelez votre intention chaque jour avant le départ, demandez à Allah de purifier votre cœur et rappelez-vous que vous partez en tant que pauvre serviteur en quête de la miséricorde de son Créateur. L'humilité doit être votre première compagne de voyage.</p>

<h3>2. Le repentir sincère (Al-Tawbah) et la réparation des torts</h3>
<p>Vous vous apprêtez à fouler la terre la plus sacrée du monde. Pour y entrer avec un cœur léger, il convient de se repentir sincèrement de ses péchés passés. La Tawbah comporte des conditions : regretter l'acte, cesser le péché et avoir la ferme intention de ne plus y retourner. De plus, si vos fautes ont causé du tort à autrui, vous devez réparer ces torts avant de partir. Remboursez vos dettes financières, demandez pardon à vos proches, réconciliez-vous avec les membres de votre famille avec qui vous êtes en froid. Entrer en état de sacralisation (Ihram) en portant le fardeau de disputes non résolues nuit gravement à la concentration spirituelle.</p>

<h3>3. Cultiver la patience (Al-Sabr) face aux imprévus</h3>
<p>La Omra est un voyage d'épreuves physiques et logistiques. Malgré les meilleurs efforts d'organisation de votre agence OmraYanair, vous ferez face à l'attente dans les aéroports, à la foule dense autour de la Kaaba, à la chaleur intense et à la fatigue. La préparation mentale consiste à accepter par avance ces désagréments comme faisant partie intégrante de votre cheminement. Face à un retard de bus ou à un pèlerin qui vous bouscule, rappelez-vous que la colère annule les mérites de vos rites. Pratiquez le silence, l'invocation constante et le pardon immédiat. C'est dans ces moments de friction que se révèle la véritable qualité de votre préparation spirituelle.</p>

<h3>4. Établir un programme spirituel quotidien</h3>
<p>N'attendez pas d'être à La Mecque pour commencer à prier à l'heure, à lire le Coran ou à faire du Dhikr. Instaurer une routine d'adoration progressive un mois avant le départ permet de conditionner votre esprit. Augmentez vos prières surérogatoires (Sunnah), levez-vous parfois la nuit pour prier (Tahajjud), et mémorisez des invocations clés en arabe avec leur sens. Plus vous serez habitué à l'effort spirituel au quotidien chez vous, plus il vous sera facile de passer vos journées en adoration intense dans les Mosquées Sacrées de La Mecque et de Médine.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png", // Illustration de la Kaaba (Spiritualité)
    publishedAt: "2026-06-20T10:00:00.000Z"
  },
  {
    id: "art-2",
    title: "Les documents administratifs obligatoires",
    summary: "Visa Omra, passeport, vaccins requis et applications indispensables. Voici la check-list complète et détaillée des formalités pour partir l'esprit serein.",
    category: "Documents",
    content: `<h3>L'importance d'une rigueur administrative absolue</h3>
<p>Un voyage spirituel réussi commence par une préparation administrative méticuleuse. L'Arabie Saoudite a grandement modernisé et numérisé ses procédures d'entrée, ce qui facilite les démarches mais exige une précision rigoureuse. Une simple erreur de frappe sur un nom ou une date de validité de passeport dépassée peut entraîner un refus d'embarquement à l'aéroport. Pour éviter tout stress inutile à quelques heures du départ, étudiez attentivement cette check-list complète des documents indispensables que notre agence OmraYanair valide systématiquement avec vous.</p>

<h3>1. Le Passeport : Validité et exigences physiques</h3>
<p>Votre passeport est la pièce maîtresse de votre voyage. Il doit impérativement remplir deux conditions non négociables. Tout d'abord, sa date de validité doit dépasser d'au moins six mois la date prévue de votre retour en France. Ensuite, il doit comporter au moins deux pages entièrement vierges et face-à-face pour permettre l'apposition des tampons d'entrée et de sortie du territoire saoudien. Nous vous conseillons de scanner votre passeport et de vous l'envoyer par email ou de le stocker sur un cloud sécurisé, et d'en imprimer une copie papier à garder séparément du document original durant vos déplacements.</p>

<h3>2. Le Visa : Choisir la bonne formule</h3>
<p>Il existe aujourd'hui deux manières principales d'entrer en Arabie Saoudite pour effectuer une Omra. La première est le Visa Omra spécifique, délivré par le biais d'agences agréées. La seconde est le Visa Touristique Électronique (E-Visa), accessible aux ressortissants de nombreux pays européens. L'E-Visa permet des entrées multiples sur une période d'un an et autorise l'accomplissement de la Omra en dehors de la période du Hajj.</p>
<p><strong>Faire sa demande de visa :</strong> Pour simplifier vos démarches de visa de manière rapide et sécurisée, vous pouvez utiliser notre plateforme dédiée : <a href="https://visasaudi.fr" target="_blank" style="color:var(--color-primary-light); font-weight:700; text-decoration:underline;">visasaudi.fr</a>. L'équipe d'OmraYanair vous accompagne également pour valider la conformité de votre dossier avant votre départ.</p>

<h3>3. Exigences sanitaires et carnet de vaccination</h3>
<p>Le ministère saoudien de la Santé met régulièrement à jour ses exigences médicales pour protéger les millions de pèlerins qui se rassemblent. Le vaccin contre la méningite à méningocoques (vaccin conjugué tétravalent ACYW135) est obligatoire pour toute personne effectuant la Omra ou le Hajj. Ce vaccin doit avoir été administré au moins 10 jours avant l'arrivée en Arabie Saoudite et sa validité ne doit pas dépasser 3 ou 5 ans (selon le type de vaccin utilisé). Vous devez présenter le Carnet Jaune de Vaccination International délivré par un centre agréé. Une assurance médicale internationale couvrant les frais de santé d'urgence liés au COVID-19 et aux hospitalisations sur place est également requise et généralement incluse dans les frais de visa.</p>

<h3>4. Les applications mobiles indispensables : Nusuk</h3>
<p>L'accès aux Lieux Saints est désormais géré via des applications gouvernementales obligatoires. L'application principale est <strong>Nusuk</strong> (qui remplace l'ancienne application Eatmarna). Il est fortement recommandé de télécharger Nusuk avant votre départ, d'y créer votre profil en y liant votre numéro de visa et de passeport. Cette application est obligatoire pour obtenir vos permis de prière dans la noble Rawdah (le jardin du Prophète, que la paix et le salut soient sur lui) à la Mosquée du Prophète à Médine, ainsi que pour planifier l'heure de votre Tawaf de Omra à La Mecque afin de réguler les flux de pèlerins.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/documents_prep.png", // Illustration de passeport et documents
    publishedAt: "2026-06-22T08:30:00.000Z"
  },
  {
    id: "art-3",
    title: "Check-list bagages : Quoi emporter en Omra ?",
    summary: "Entre le climat chaud, la marche intense et les contraintes de l'Ihram, découvrez nos conseils d'experts pour voyager léger mais complet, sans rien oublier d'essentiel.",
    category: "Bagages",
    content: `<h3>Voyager intelligent : équilibre entre légèreté et conformité</h3>
<p>Faire sa valise pour la Omra demande une réflexion particulière. Vous allez voyager dans un pays chaud, où les températures dépassent fréquemment les 40 degrés en journée, tout en devant respecter les règles vestimentaires strictes de l'état de sacralisation (Ihram) pour les rites. L'objectif est de voyager léger pour faciliter vos déplacements entre Médine et La Mecque, tout en ayant sous la main les outils spirituels et de confort nécessaires. Voici la check-list exhaustive élaborée par les accompagnateurs d'OmraYanair pour vous assurer un confort optimal.</p>

<h3>1. Les vêtements d'Ihram et accessoires pour les hommes</h3>
<p>L'Ihram masculin se compose de deux pièces de tissu blanc non cousues (le Izar pour le bas et le Rida pour le haut). Prévoyez au moins deux jeux complets d'Ihram de bonne qualité, de préférence en coton 100% éponge ou en microfibre respirante pour absorber la transpiration et éviter les irritations. Apportez une ceinture solide (en cuir ou en tissu robuste) sans coutures apparentes pour maintenir l'Izar en place et y ranger vos objets de valeur (téléphone, clés d'hôtel, argent). Pensez également à emporter des épingles à nourrice de sécurité pour fixer le tissu et éviter qu'il ne glisse lors de vos mouvements pendant le Tawaf.</p>

<h3>2. La garde-robe féminine pour le pèlerinage</h3>
<p>Pour les femmes, il n'y a pas de vêtement d'Ihram spécifique imposé, mais les vêtements doivent être amples, couvrants, non transparents et pudiques. Privilégiez des abayas légères en coton ou en lin de couleurs sobres (noir, blanc, bleu marine, gris). Prévoyez 3 à 4 hijabs faciles à enfiler et confortables, de préférence sans aiguilles ou épingles pointues qui pourraient vous blesser ou blesser d'autres pèlerins dans la foule. Emportez des sous-vêtements en coton et des pantalons légers à porter sous les abayas pour éviter les frottements désagréables lors des longues marches.</p>

<h3>3. Chaussures et protection des pieds</h3>
<p>Vous marcherez des dizaines de kilomètres pendant votre séjour. Durant l'Ihram, les hommes doivent porter des sandales ou des claquettes qui ne couvrent ni les chevilles ni le dessus du pied. Choisissez des sandales ergonomiques avec une bonne semelle amortissante pour éviter les douleurs articulaires. Pour les moments en dehors de l'Ihram, et pour les femmes durant tout le pèlerinage, de bonnes baskets de marche souples et aérées sont idéales. Apportez plusieurs paires de chaussettes en coton épais, car le marbre blanc des esplanades du Haram peut être très chaud en journée ou frais durant la nuit.</p>

<h3>4. Trousse de toilette et soins médicaux spécifiques</h3>
<p>Attention : dès que vous entrez en état d'Ihram, l'usage de produits parfumés est strictement interdit (savon, shampoing, gel douche, lingettes). Achetez une trousse de toilette spéciale Omra contenant des produits certifiés sans parfum. Côté santé, la vaseline ou une crème anti-frottements est indispensable pour prévenir les irritations cutanées douloureuses entre les cuisses (particulièrement pour les hommes marchant en Ihram). Emportez également du paracétamol, des pastilles pour la gorge (l'air conditionné des mosquées assèche beaucoup les voies respiratoires), du sérum physiologique et une petite crème solaire écran total.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/luggage_prep.png", // Illustration de valise/bagages
    publishedAt: "2026-06-23T14:15:00.000Z"
  },
  {
    id: "art-4",
    title: "Guide pas à pas des rites de la Omra",
    summary: "De l'Ihram au rasage des cheveux, apprenez en détail les 4 piliers essentiels de la Omra de manière claire, structurée et conforme à la Sunnah.",
    category: "Rites",
    content: `<h3>Comprendre pour mieux vivre ses rites</h3>
<p>L'accomplissement de la Omra repose sur quatre étapes fondamentales appelées piliers (Arkan) et obligations (Wajibat). Connaître précisément le déroulement de chaque rite vous permet de rester concentré sur l'essentiel : l'invocation et la dévotion, sans être perturbé par le doute ou l'hésitation. Voici le guide méthodologique pas à pas validé par nos guides spirituels pour réaliser votre Omra dans le respect strict des enseignements du Prophète (que la paix et le salut soient sur lui).</p>

<h3>Étape 1 : L'état d'Ihram (La Sacralisation)</h3>
<p>L'Ihram commence avant de franchir la limite géographique appelée Miqat. Pour les pèlerins arrivant de France par avion, cela se fait généralement à bord de l'appareil ou lors de l'escale. Le pèlerin se purifie (douche, coupe des ongles), revêt les vêtements d'Ihram et formule l'intention sincère dans son cœur en disant : <i>"Labbayka Allāhoumma 'Omratan"</i> (Me voici, ô Allah, pour une Omra). Dès cet instant, les interdictions de l'Ihram s'appliquent (pas de parfum, pas de coupe de cheveux ou d'ongles, pas de relations conjugales, pas de disputes). Le pèlerin commence alors à réciter à voix haute la Talbiyah : <i>"Labbayka Allāhoumma Labbayk, Labbayka lâ charîka laka Labbayk..."</i>, et continue jusqu'à apercevoir la Kaaba.</p>

<h3>Étape 2 : Le Tawaf (Les 7 tours de la Kaaba)</h3>
<p>En arrivant à la Mosquée Sacrée (Al-Masjid Al-Haram), le pèlerin entre du pied droit en prononçant l'invocation d'entrée à la mosquée. Il se dirige vers la Kaaba pour commencer le Tawaf. Le Tawaf consiste à faire sept rotations complètes autour de la Kaaba, dans le sens inverse des aiguilles d'une montre, en commençant et en finissant au niveau de la Pierre Noire (Al-Hajar Al-Aswad). À chaque passage devant la Pierre Noire, le pèlerin fait un signe de la main droite en disant <i>"Allāhou Akbar"</i>. Pendant le Tawaf, il n'y a pas d'invocation spécifique obligatoire : le pèlerin fait du Dhikr, récite le Coran et implore Allah avec ses propres mots. Entre le Coin Yéménite et la Pierre Noire, il est recommandé de dire : <i>"Rabbanâ âtinâ fi-d-dounyâ ḥassanatan wa fil-âkhirati ḥassanatan wa qinâ 'adhâba-n-nâr"</i>. Après les sept tours, le pèlerin prie deux unités de prière derrière le Maqam Ibrahim (ou ailleurs dans le Haram si la foule est trop dense) puis boit de l'eau bénite de Zamzam.</p>

<h3>Étape 3 : Le Sa'y (La marche entre Safa et Marwah)</h3>
<p>Le pèlerin se dirige ensuite vers le mont Safa pour débuter le Sa'y, qui commémore la quête d'eau de Hajar pour son fils Ismaïl. Le Sa'y consiste en sept trajets entre les collines de Safa et Marwah. Un aller simple de Safa à Marwah compte pour un trajet, et le retour de Marwah à Safa compte pour le deuxième trajet. Le rite commence donc à Safa et se termine à Marwah. Sur les collines, le pèlerin se tourne vers la Kaaba, lève les mains et prononce des formules de glorification d'Allah. Entre les deux collines, des néons verts indiquent une zone où il est fortement recommandé aux hommes de presser le pas ou de trotter légèrement. Le Sa'y se fait également au rythme des invocations personnelles et du Dhikr.</p>

<h3>Étape 4 : Le Halq ou Taqsir (La désacralisation)</h3>
<p>Une fois le septième trajet achevé au mont Marwah, les rites de la Omra sont terminés. Pour sortir de l'état de sacralisation (Ihram) et retrouver un état normal, le pèlerin doit procéder à la coupe de cheveux. Pour les hommes, il est préférable de se raser complètement la tête (Halq) ou de couper l'ensemble des cheveux très court (Taqsir). Pour les femmes, il suffit de rassembler ses cheveux et d'en couper l'équivalent d'une phalange de doigt (Taqsir). Une fois cette étape accomplie, le pèlerin est officiellement désacralisé : toutes les restrictions de l'Ihram sont levées. Félicitations, votre Omra est accomplie !</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/rites_omra.png", // Illustration de la grande mosquée de la mecque (Rites)
    publishedAt: "2026-06-24T09:00:00.000Z"
  }
];

const SEED_TESTIMONIES = [
  {
    id: "test-1",
    name: "Yassine",
    city: "Lyon",
    country: "France",
    email: "yassine.l@example.com",
    text: "Une organisation exceptionnelle du début à la fin. Le guide spirituel fourni par OmraYanair a été d'une aide précieuse pour vivre pleinement chaque rite. Je recommande vivement pour tous ceux qui cherchent la sérénité et le confort.",
    status: "published",
    images: [],
    submittedAt: "2026-06-21T18:22:00.000Z",
    publishedAt: "2026-06-22T09:00:00.000Z"
  },
  {
    id: "test-2",
    name: "Aïcha",
    city: "Bruxelles",
    country: "Belgique",
    email: "aicha.b@example.com",
    text: "Un voyage inoubliable. L'hôtel était très proche du Haram, ce qui nous a permis de faire toutes nos prières sur place sans fatigue. Les conseils pratiques sur les bagages partagés par l'équipe avant le départ nous ont évité bien des soucis.",
    status: "published",
    images: [],
    submittedAt: "2026-06-23T11:05:00.000Z",
    publishedAt: "2026-06-23T16:00:00.000Z"
  }
];

// LocalStorage Keys
const ARTICLES_KEY = "pelerin_articles";
const TESTIMONIES_KEY = "pelerin_testimonies";
const ADMIN_LOGGED_KEY = "pelerin_admin_logged";

export const db = {
  init() {
    // If already seeded, check if we need to update/reset to get the 500-word articles
    const existing = localStorage.getItem(ARTICLES_KEY);
    if (!existing || JSON.parse(existing).length < 5 || JSON.parse(existing)[0].content.length < 1000) {
      // Seed or override to ensure the new long articles are loaded
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(SEED_ARTICLES));
    }
    if (!localStorage.getItem(TESTIMONIES_KEY)) {
      localStorage.setItem(TESTIMONIES_KEY, JSON.stringify(SEED_TESTIMONIES));
    }
  },

  // PUBLIC ARTICLES
  getPublishedArticles() {
    const list = JSON.parse(localStorage.getItem(ARTICLES_KEY) || "[]");
    return list
      .filter(a => a.status === "published")
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  getArticleById(id) {
    const list = JSON.parse(localStorage.getItem(ARTICLES_KEY) || "[]");
    return list.find(a => a.id === id);
  },

  // PUBLIC TESTIMONIES
  getPublishedTestimonies() {
    const list = JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]");
    return list
      .filter(t => t.status === "published")
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  // USER SUBMISSION
  submitTestimony(testimonyData) {
    const list = JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]");
    const newTestimony = {
      id: "test-" + Date.now(),
      name: testimonyData.name,
      city: testimonyData.city,
      country: testimonyData.country,
      email: testimonyData.email, // Kept private
      text: testimonyData.text,
      status: "pending",
      images: testimonyData.images || [], // Base64 encoded or URLs
      submittedAt: new Date().toISOString(),
      publishedAt: null
    };
    list.push(newTestimony);
    localStorage.setItem(TESTIMONIES_KEY, JSON.stringify(list));
    return newTestimony;
  },

  // ADMIN AUTH
  loginAdmin(email, password) {
    // Standard mock credentials
    if (email === "admin@omrayanair.com" && password === "Pelerin2026!") {
      localStorage.setItem(ADMIN_LOGGED_KEY, "true");
      return true;
    }
    return false;
  },

  logoutAdmin() {
    localStorage.removeItem(ADMIN_LOGGED_KEY);
  },

  isAdminLogged() {
    return localStorage.getItem(ADMIN_LOGGED_KEY) === "true";
  },

  // ADMIN TESTIMONIES MANAGEMENT
  getAllTestimonies() {
    return JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]")
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  updateTestimonyStatus(id, status) {
    const list = JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]");
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (status === "published") {
        list[index].publishedAt = new Date().toISOString();
      }
      localStorage.setItem(TESTIMONIES_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  },

  editTestimony(id, updatedFields) {
    const list = JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]");
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      localStorage.setItem(TESTIMONIES_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteTestimony(id) {
    let list = JSON.parse(localStorage.getItem(TESTIMONIES_KEY) || "[]");
    list = list.filter(t => t.id !== id);
    localStorage.setItem(TESTIMONIES_KEY, JSON.stringify(list));
    return true;
  },

  // ADMIN ARTICLES MANAGEMENT
  getAllArticles() {
    return JSON.parse(localStorage.getItem(ARTICLES_KEY) || "[]")
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  },

  saveArticle(articleData) {
    const list = JSON.parse(localStorage.getItem(ARTICLES_KEY) || "[]");
    if (articleData.id) {
      // Edit
      const index = list.findIndex(a => a.id === articleData.id);
      if (index !== -1) {
        list[index] = { 
          ...list[index], 
          ...articleData,
          publishedAt: articleData.status === "published" && !list[index].publishedAt 
            ? new Date().toISOString() 
            : list[index].publishedAt
        };
      }
    } else {
      // New
      const newArticle = {
        id: "art-" + Date.now(),
        title: articleData.title,
        summary: articleData.summary,
        category: articleData.category,
        content: articleData.content,
        imageUrl: articleData.imageUrl || "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=800",
        status: articleData.status,
        publishedAt: articleData.status === "published" ? new Date().toISOString() : null
      };
      list.push(newArticle);
    }
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(list));
    return true;
  },

  deleteArticle(id) {
    let list = JSON.parse(localStorage.getItem(ARTICLES_KEY) || "[]");
    list = list.filter(a => a.id !== id);
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(list));
    return true;
  }
};
