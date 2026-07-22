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
  },
  {
    id: "art-5",
    title: "Guide pratique de l'assurance médicale du visa Omra (Ch. 1 à 5)",
    summary: "Comment fonctionne l'assurance médicale obligatoire associée à votre visa Omra ? Retrouvez votre compagnie, comprenez les garanties et découvrez les exclusions.",
    category: "Conseils pratiques",
    content: `<h3>1. Introduction</h3>
<p>Les autorités du Royaume d'Arabie saoudite incluent automatiquement une assurance médicale avec la plupart des visas Omra. Cette assurance est destinée à protéger les pèlerins en cas de problème médical survenant durant leur séjour.</p>
<p>Cependant, de nombreux voyageurs ignorent comment retrouver leur assurance, ce qu'elle couvre réellement, comment contacter leur compagnie d'assurance, ou quelles démarches effectuer en cas de maladie ou d'accident. Ce guide répond à ces questions et vous explique les principales procédures à suivre.</p>
<blockquote><strong>Important :</strong> Ce guide est fourni à titre informatif. Les garanties exactes dépendent de la compagnie d'assurance qui vous a été attribuée par les autorités saoudiennes.</blockquote>

<h3>2. Comprendre votre assurance</h3>
<h4>Une assurance obligatoire</h4>
<p>Lorsque votre visa Omra est délivré, une assurance médicale est automatiquement associée à celui-ci. Vous n'avez aucune démarche supplémentaire à effectuer. L'objectif de cette assurance est de permettre la prise en charge des <strong>urgences médicales</strong> pendant votre séjour.</p>
<p>⚠️ Cette assurance n'est <strong>pas</strong> une assurance santé classique. Elle est principalement prévue pour les urgences médicales, les accidents, les hospitalisations, et certaines interventions médicales urgentes. Les consultations de confort ou les soins non urgents peuvent ne pas être couverts.</p>
<h4>Pourquoi ne reçoit-on pas toujours la police d'assurance ?</h4>
<p>Il est fréquent que le portail officiel du visa transmette uniquement le visa électronique et le document d'autorisation de voyage, sans joindre la police d'assurance détaillée. Cela est normal. Votre assurance existe bien et peut être retrouvée grâce aux services officiels des autorités saoudiennes.</p>

<h3>3. Comment retrouver votre assurance ?</h3>
<p>Deux sites officiels permettent de consulter votre assurance :</p>
<ul>
  <li><strong>Méthode n°1 (recommandée) via l'Insurance Authority :</strong> <a href="https://www.ia.gov.sa/en/Health-Insurance-Hajj-Umrah" target="_blank" style="color:var(--color-primary-light); font-weight:700; text-decoration:underline;">ia.gov.sa/en/Health-Insurance-Hajj-Umrah</a>. Vous pourrez effectuer une recherche avec votre numéro de passeport, votre numéro de visa ou votre Border Number (numéro d'entrée) pour consulter le nom de votre compagnie et la validité de votre couverture.</li>
  <li><strong>Méthode n°2 via le Council of Health Insurance (CHI) :</strong> <a href="https://www.chi.gov.sa/en/servicesdirectory/pages/eservices-checkvisitorsinsurance.aspx" target="_blank" style="color:var(--color-primary-light); font-weight:700; text-decoration:underline;">chi.gov.sa/en/servicesdirectory</a>. Ce portail permet de vérifier l'activation de votre assurance et d'obtenir les coordonnées de votre assureur.</li>
</ul>
<blockquote><strong>Notre conseil :</strong> Nous vous recommandons d'effectuer cette recherche dès votre arrivée en Arabie saoudite et de prendre une capture d'écran des informations de votre assureur.</blockquote>

<h3>4. Que couvre cette assurance ?</h3>
<p>Cette assurance est principalement destinée aux situations d'urgence. Selon la compagnie d'assurance, elle peut notamment couvrir :</p>
<ul>
  <li>Les urgences médicales et consultations d'urgence ;</li>
  <li>Les hospitalisations et examens médicaux urgents ;</li>
  <li>Les analyses et médicaments prescrits lors d'une urgence ;</li>
  <li>Les interventions chirurgicales urgentes, fractures, accidents ou brûlures ;</li>
  <li>Les transports en ambulance lorsque nécessaires et le rapatriement.</li>
</ul>

<h3>5. Ce qui n'est généralement pas couvert</h3>
<p>Comme la plupart des assurances voyage, cette assurance comporte certaines exclusions. Dans la majorité des contrats, ne sont généralement pas pris en charge :</p>
<ul>
  <li>Les consultations de confort et bilans médicaux ;</li>
  <li>Les traitements programmés ou maladies préexistantes ;</li>
  <li>Les soins dentaires non urgents et médicaments achetés sans prescription médicale.</li>
</ul>
<p>Chaque compagnie applique ses propres conditions générales. Les garanties exactes figurent dans votre police d'assurance.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png",
    publishedAt: "2026-07-06T00:00:00.000Z"
  },
  {
    id: "art-6",
    title: "Guide pratique de l'assurance médicale du visa Omra (Ch. 6 à 10)",
    summary: "Urgences vs consultations simples, démarches de prise en charge et de remboursement, et documents indispensables à conserver en cas de soins médicaux.",
    category: "Conseils pratiques",
    content: `<h3>6. Ce qui n'est généralement pas couvert</h3>
<p>L'assurance médicale incluse avec le visa Omra est principalement destinée aux <strong>urgences médicales</strong>. Elle ne remplace pas une assurance santé complète.</p>
<p>Selon les conditions propres à chaque compagnie, les situations suivantes ne sont généralement pas couvertes :</p>
<ul>
  <li>Les consultations de confort et les bilans de santé ou examens de routine ;</li>
  <li>Les soins esthétiques et les traitements programmés avant le voyage ;</li>
  <li>Les maladies préexistantes (selon les contrats) et les soins dentaires non urgents ;</li>
  <li>Les médicaments achetés sans ordonnance et les soins qui ne présentent pas de caractère d'urgence.</li>
</ul>
<blockquote><strong>Important :</strong> Les garanties varient selon la compagnie d'assurance qui vous a été attribuée. Consultez toujours votre police d'assurance ou contactez votre assureur avant d'engager des frais pour une situation non urgente.</blockquote>

<h3>7. Que faire en cas d'urgence ?</h3>
<p>En cas d'urgence médicale, votre santé est la priorité absolue.</p>
<ol>
  <li><strong>Étape 1 : Se rendre aux urgences.</strong> Si votre état le permet, rendez-vous immédiatement au service des urgences de l'hôpital le plus proche. Si vous ne pouvez pas vous déplacer ou que votre état est grave, appelez une ambulance. Ne retardez jamais votre prise en charge médicale dans l'attente d'une autorisation de votre assurance.</li>
  <li><strong>Étape 2 : Présenter vos documents.</strong> À votre arrivée, présentez si possible votre passeport, votre visa, et les informations ou la police de votre compagnie d'assurance.</li>
  <li><strong>Étape 3 : Contacter votre assurance.</strong> Dès que votre état le permet, contactez le service d'assistance de votre compagnie d'assurance. Selon les compagnies, l'hôpital pourra demander directement une autorisation de prise en charge, ou il pourra vous être demandé de contacter vous-même l'assistance. Suivez toujours les instructions de votre assureur.</li>
  <li><strong>Étape 4 : Conserver tous les documents.</strong> Même si l'hôpital indique que les frais seront pris en charge, conservez tous les documents remis lors de votre prise en charge.</li>
</ol>

<h3>8. Consultation simple ou urgence ?</h3>
<p>Il est important de distinguer une urgence médicale d'une consultation simple.</p>
<p><strong>Exemples de situations généralement considérées comme urgentes :</strong> accident, fracture, perte de connaissance, douleur thoracique importante, difficulté respiratoire, saignement abondant, brute grave, forte réaction allergique ou hospitalisation nécessaire. Ces situations nécessitent une prise en charge immédiate.</p>
<p><strong>Exemples de consultations simples :</strong> rhume, toux, mal de gorge, fatigue, renouvellement d'un traitement, contrôle médical ou douleur légère sans signe de gravité. Dans ces cas, il est recommandé de contacter votre compagnie d'assurance avant de consulter un médecin. Elle pourra vous indiquer un établissement partenaire, la procédure à suivre, ou vous informer si les frais restent à votre charge.</p>
<blockquote><strong>En cas de doute sur la gravité de votre état, privilégiez toujours la sécurité et consultez rapidement un professionnel de santé.</strong></blockquote>

<h3>9. Paiement et remboursement</h3>
<p>La procédure dépend de la compagnie d'assurance et de l'établissement médical. Deux situations sont possibles :</p>
<ul>
  <li><strong>Prise en charge directe :</strong> L'établissement médical contacte directement votre assurance. Après validation, les frais couverts sont réglés directement par l'assureur. Dans ce cas, vous n'avez généralement pas à avancer les frais couverts.</li>
  <li><strong>Paiement puis demande de remboursement :</strong> Dans certaines situations, il pourra vous être demandé de régler les frais médicaux. Vous devrez ensuite transmettre un dossier à votre compagnie d'assurance afin de demander un remboursement, conformément aux conditions de votre contrat. Le remboursement n'est pas automatique et dépend des garanties prévues par votre police d'assurance.</li>
</ul>

<h3>10. Documents à conserver</h3>
<p>Que votre assurance prenne directement les frais en charge ou que vous les avanciez, conservez soigneusement tous les documents suivants :</p>
<ul>
  <li>Les factures originales et reçus de paiement ;</li>
  <li>Les ordonnances et prescriptions de médicaments ;</li>
  <li>Les comptes rendus médicaux et résultats d'analyses ou examens d'imagerie.</li>
</ul>
<blockquote><strong>Conseil :</strong> Photographiez immédiatement chaque document avec votre téléphone afin d'en conserver une copie numérique en cas de perte.</blockquote>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png",
    publishedAt: "2026-07-06T00:00:00.000Z"
  },
  {
    id: "art-7",
    title: "Guide pratique de l'assurance médicale du visa Omra (Ch. 11 à 14)",
    summary: "FAQ de l'assurance, conseils pratiques pour votre départ/arrivée, coordonnées utiles des portails officiels de l'Insurance Authority et du CHI, et mentions légales.",
    category: "Conseils pratiques",
    content: `<h3>11. Questions fréquentes (FAQ)</h3>
<p><strong>Je n'ai pas reçu ma police d'assurance. Suis-je assuré ?</strong><br>
Oui. Il est fréquent que le portail officiel du visa transmette uniquement le visa électronique, sans joindre la police d'assurance. Vous pouvez retrouver les informations relatives à votre assurance grâce aux portails officiels indiqués dans ce guide.</p>

<p><strong>Puis-je consulter n'importe quel médecin ?</strong><br>
Pas toujours. Selon votre compagnie d'assurance, certains établissements de santé peuvent être partenaires. Avant toute consultation non urgente, il est recommandé de contacter votre assureur afin de connaître la procédure à suivre.</p>

<p><strong>Dois-je avancer les frais médicaux ?</strong><br>
Cela dépend de votre compagnie d'assurance et de l'établissement dans lequel vous êtes pris en charge. Deux situations sont possibles : la prise en charge directe par l'assurance, ou le paiement des frais puis demande de remboursement.</p>

<p><strong>Une consultation pour un rhume est-elle couverte ?</strong><br>
Pas nécessairement. L'assurance du visa Omra est principalement destinée aux urgences médicales. Pour une consultation simple, contactez votre compagnie d'assurance avant de consulter.</p>

<p><strong>Puis-je être remboursé après mon retour dans mon pays ?</strong><br>
Selon les conditions de votre contrat, cela peut être possible. Conservez impérativement toutes les factures, ordonnances, reçus de paiement et documents médicaux.</p>

<p><strong>Que faire si je ne parle ni arabe ni anglais ?</strong><br>
N'hésitez pas à demander de l'aide à un membre de votre groupe, à votre accompagnateur ou au personnel de l'hôtel. Les établissements hospitaliers accueillant des pèlerins disposent souvent d'un personnel habitué aux visiteurs internationaux.</p>

<h3>12. Conseils pratiques</h3>
<p><strong>Avant votre départ :</strong></p>
<ul>
  <li>Vérifiez la validité de votre passeport et conservez-en une copie papier.</li>
  <li>Enregistrez une copie numérique de votre visa sur votre téléphone.</li>
  <li>Emportez vos traitements médicaux habituels en quantité suffisante.</li>
</ul>
<p><strong>À votre arrivée :</strong></p>
<ul>
  <li>Recherchez votre assurance sur l'un des deux portails officiels saoudiens.</li>
  <li>Notez le nom de votre compagnie d'assurance et enregistrez son numéro d'assistance.</li>
  <li>Faites une capture d'écran de votre police d'assurance.</li>
</ul>
<p><strong>En cas de consultation ou d'hospitalisation :</strong></p>
<ul>
  <li>Présentez toujours votre passeport et votre visa.</li>
  <li>Conservez tous les documents remis par le médecin et toutes les factures.</li>
  <li>Photographiez immédiatement chaque document.</li>
</ul>

<h3>13. Coordonnées utiles</h3>
<p><strong>Portails officiels :</strong></p>
<ul>
  <li><strong>Insurance Authority :</strong> <a href="https://www.ia.gov.sa/en/Health-Insurance-Hajj-Umrah" target="_blank" style="color:var(--color-primary-light); font-weight:700; text-decoration:underline;">ia.gov.sa/en/Health-Insurance-Hajj-Umrah</a>. Permet de consulter votre assurance à l'aide de votre passeport, de votre numéro de visa ou de votre Border Number.</li>
  <li><strong>Council of Health Insurance (CHI) :</strong> <a href="https://www.chi.gov.sa/en/servicesdirectory/pages/eservices-checkvisitorsinsurance.aspx" target="_blank" style="color:var(--color-primary-light); font-weight:700; text-decoration:underline;">chi.gov.sa/en/servicesdirectory</a>. Permet de vérifier la validité de votre assurance et d'identifier votre compagnie.</li>
</ul>
<p><strong>OmraYanair LLC :</strong> Pour toute question concernant l'organisation de votre séjour Omra (programme, transferts, hôtels, visites, etc.), contactez-nous :</p>
<ul>
  <li>Site internet : <a href="http://omrayanair.novaskill.tech" target="_blank">omrayanair.novaskill.tech</a></li>
  <li>E-mail : <a href="mailto:omrayanair@gmail.com">omrayanair@gmail.com</a></li>
  <li>WhatsApp : <strong>+212 7 16 01 41 48</strong></li>
  <li>Siège social : OmraYanair LLC, Albuquerque, New Mexico, États-Unis.</li>
</ul>
<blockquote><strong>Remarque :</strong> OmraYanair LLC n'est ni une compagnie d'assurance ni un établissement de santé. Pour toute urgence médicale, contactez immédiatement les services d'urgence ou votre compagnie d'assurance.</blockquote>

<h3>14. Mentions légales et avertissement</h3>
<p>Ce guide est fourni exclusivement à titre informatif. Les informations qu'il contient sont basées sur les procédures généralement applicables au moment de sa rédaction. Les garanties, exclusions, plafonds de remboursement et procédures de prise en charge peuvent varier selon la compagnie d'assurance attribuée avec votre visa.</p>
<p>En cas de différence entre ce guide et votre police d'assurance, <strong>les conditions de votre contrat d'assurance prévalent</strong>. OmraYanair LLC ne peut être tenue responsable des décisions prises par les compagnies d'assurance, les établissements de santé ou les autorités compétentes.</p>
<p>Qu'Allah accepte votre Omra et vous accorde santé, sécurité et facilité tout au long de votre voyage.</p>
<p style="font-weight:bold; font-style:italic; text-align:right;">L'Équipe OmraYanair LLC</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png",
    publishedAt: "2026-07-06T00:00:00.000Z"
  },
  {
    id: "art-8",
    title: "Créer sa propre conciergerie Omra : L'indépendance avec la Méthode OMRAYANAIR",
    summary: "Découvrez comment le modèle de la conciergerie autonome révolutionne l'organisation du pèlerinage sacré en éliminant les intermédiaires pour maximiser la qualité de service et la rentabilité.",
    category: "Entreprendre",
    content: `<h3>Une nouvelle ère pour l'organisation du pèlerinage</h3>
<p>Pendant des décennies, organiser un voyage pour la Omra nécessitait de passer par des intermédiaires lourds et des grossistes commissionnés. Ce modèle traditionnel imposait des marges réduites pour les organisateurs et une perte de contrôle sur la qualité réelle des prestations fournies aux pèlerins (hôtels éloignés, transferts en bus de mauvaise qualité, manque d'accompagnement).</p>
<p>Aujourd'hui, grâce à la numérisation des visas et à la libéralisation des services en Arabie Saoudite, une opportunité unique s'ouvre : créer votre propre **Conciergerie Omra Autonome**. La Méthode OMRAYANAIR a été conçue précisément pour vous transmettre les clés de ce modèle performant et éthique.</p>

<h3>1. Qu'est-ce qu'une Conciergerie Omra Autonome ?</h3>
<p>Contrairement au rôle de simple revendeur (ou sous-agent) qui touche une commission fixe de 35 € par pèlerin, le créateur de conciergerie travaille **en direct**. Vous négociez vos propres tarifs de vols auprès des compagnies low-cost et régulières, vous réservez directement vos chambres dans les hôtels de La Mecque et Médine, et vous sélectionnez vos propres guides de confiance sur place. Ce modèle vous permet de conserver l'intégralité de la valeur créée (avec une marge moyenne de 12% à 22% par dossier) tout en garantissant des prestations haut de gamme à vos pèlerins.</p>

<h3>2. Les piliers de la formation d'accompagnement OMRAYANAIR</h3>
<p>Le programme d'incubation d'OMRAYANAIR n'est pas une simple formation théorique en vidéo. C'est un accompagnement **100% présentiel et personnalisé** axé sur la mise en application immédiate :</p>
<ul>
  <li><strong>Ingénierie Logistique :</strong> Apprenez à assembler des packages sur mesure (vols, hôtels, transferts, visas, visites).</li>
  <li><strong>Réseau Saoudien en direct :</strong> Accédez à notre carnet d'adresses de fournisseurs locaux certifiés (hôtels, transporteurs officiels, guides francophones).</li>
  <li><strong>Écosystème Numérique :</strong> Nous configurons pour vous votre site internet, vos outils de gestion de pèlerins et votre facturation sous votre propre marque.</li>
  <li><strong>Marketing d'Acquisition :</strong> Maîtrisez les stratégies d'acquisition organique via TikTok et l'intelligence artificielle pour attirer vos premiers clients sans budget publicitaire.</li>
</ul>

<h3>3. Un retour sur investissement rapide</h3>
<p>L'accompagnement est structuré pour être rentabilisé dès vos premiers départs. Avec les formules optimisées apprises lors de l'incubation, le coût de votre formation se rentabilise rapidement :</p>
<ul>
  <li>Format Individuel (4 900 € HT) : Rentabilisé dès ~25 pèlerins accompagnés.</li>
  <li>Formule Prête à Lancer (8 900 € HT) : Rentabilisée dès ~45 pèlerins.</li>
  <li>Pack Immersion Arabie (13 900 € HT) : Rentabilisé dès ~70 pèlerins.</li>
</ul>
<p>En moyenne, un seul départ de groupe standard de 30 personnes suffit à couvrir l'intégralité de l'investissement initial.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/rites_omra.png",
    publishedAt: "2026-07-20T01:00:00.000Z"
  },
  {
    id: "art-9",
    title: "La Hijra à Médine : Les mérites spirituels et prophétiques de la ville sainte",
    summary: "Médine Al-Munawwarah n'est pas seulement un lieu historique, c'est un refuge béni. Découvrez l'importance de s'installer ou d'accomplir sa Hijra à Médine à la lumière des hadiths authentiques.",
    category: "Médine & Hijra",
    content: `<h3>Médine, le refuge de la foi et du Prophète (SWS)</h3>
<p>Médine Al-Munawwarah (la Lumineuse), anciennement appelée Yathrib, occupe une place unique dans le cœur des croyants. Ville d'accueil du Messager d'Allah (que la paix et le salut soient sur lui) lors de la noble émigration (la Hijra), elle est le berceau de la société islamique et le lieu où repose le Prophète. S'installer à Médine ou y accomplir sa Hijra est un idéal spirituel profond pour de nombreux musulmans cherchant à vivre dans la proximité physique de la Sunnah.</p>

<h3>1. Médine, le sanctuaire protecteur et la bénédiction multipliée</h3>
<p>Tout comme La Mecque, Médine est un territoire sacré (Haram) décrété par le Prophète lui-même. Dans un hadith authentique rapporté par l'Imam Al-Bukhari et l'Imam Muslim, le Prophète (SWS) a dit :</p>
<blockquote>
  "Médine est un sanctuaire entre le mont 'Ayr et le mont Thawr. Quiconque y commet une hérésie ou y donne refuge à un hérétique encourt la malédiction d'Allah, des anges et de toute l'humanité."
</blockquote>
<p>De plus, la bénédiction (Barakah) de Médine a fait l'objet d'une invocation prophétique spécifique :</p>
<blockquote>
  "Ô Allah ! Mets à Médine le double de la bénédiction que Tu as mise à La Mecque." (Sahih Al-Bukhari & Muslim)
</blockquote>

<h3>2. La foi se réfugie à Médine</h3>
<p>Dans les moments de troubles et à l'approche de la fin des temps, Médine demeure une forteresse pour la foi. Le Prophète (SWS) a affirmé :</p>
<blockquote>
  "La foi se réfugie à Médine comme le serpent se réfugie dans son terrier." (Sahih Al-Bukhari)
</blockquote>
<p>C'est une ville qui purifie ses habitants de leurs défauts et de leurs hypocrisies. Le Messager d'Allah (SWS) l'a comparée à un outil de métallurgie :</p>
<blockquote>
  "Elle purifie les gens de leurs impuretés comme le soufflet élimine les scories du fer." (Sahih Al-Bukhari)
</blockquote>

<h3>3. L'immense mérite de mourir à Médine</h3>
<p>Le plus beau cadeau auquel puisse aspirer un habitant de Médine est de terminer ses jours sur cette terre bénie et d'être enterré au cimetière d'Al-Baqi', aux côtés des compagnons du Prophète. Le Messager d'Allah (SWS) a encouragé les croyants à s'y installer avec cette promesse :</p>
<blockquote>
  "Quiconque parmi vous peut mourir à Médine, qu'il y meure, car j'intercéderai pour quiconque y meurt." (Rapporté par l'Imam Ahmad et l'Imam At-Tirmidhi, authentifié par Al-Albani)
</blockquote>

<h3>Conclusion : Vivre à Médine, un privilège qui exige du respect</h3>
<p>Vivre la Hijra à Médine est une opportunité spirituelle sans équivalent. Cependant, habiter dans la ville du Prophète (SWS) exige également une rigueur de comportement et une politesse spirituelle exemplaire. Les bonnes actions y sont multipliées par la grâce d'Allah. Quant aux péchés, bien qu'ils ne soient pas multipliés en nombre — car la justice absolue d'Allah fait qu'un péché n'est comptabilisé que comme un seul —, leur gravité et leur laideur spirituelle sont plus grandes en raison de la sacralité du lieu. C'est une terre de paix, de sérénité (Sakinah) et de dévotion qui transforme quiconque y réside avec sincérité.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png",
    publishedAt: "2026-07-20T02:00:00.000Z"
  },
  {
    id: "art-10",
    title: "Les mérites de La Mecque : Vertus de la cité sacrée et récompenses des adorations",
    summary: "Découvrez les mérites uniques d'Al-Masjid Al-Haram à La Mecque à travers les textes prophétiques authentiques, les bénédictions des prières multipliées, du Tawaf et de l'eau de Zamzam.",
    category: "La Mecque",
    content: `<h3>La Mecque, mère des cités et terre aimée d'Allah</h3>
<p>La Mecque (Bakkah) est le centre spirituel de l'Islam. C'est là que se dresse la Kaaba, la première Maison construite pour l'humanité pour adorer Allah le Très-Haut. Elle possède des mérites exclusifs et sacrés définis par les textes authentiques du Coran et de la Sunnah du Prophète (SWS).</p>

<h3>1. La sacralisation éternelle de La Mecque</h3>
<p>La Mecque est une terre inviolable et protégée par décret divin. Lors de la conquête de La Mecque, le Prophète (que la paix et le salut soient sur lui) a proclamé sa sacralité dans un hadith célèbre rapporté par Al-Bukhari et Muslim :</p>
<blockquote>
  "Certes, cette ville a été sacrée par Allah le jour où Il a créé les cieux et la terre. Elle est donc sacrée par la sacralisation d'Allah jusqu'au Jour de la Résurrection. On ne doit pas couper ses arbres épineux, ni chasser son gibier, ni ramasser les objets trouvés à moins de les faire connaître, ni couper ses herbes fraîches."
</blockquote>
<p>Le Messager d'Allah (SWS) a également exprimé son amour profond pour cette ville sainte en s'adressant à elle :</p>
<blockquote>
  "Par Allah ! Tu es certes la meilleure terre d'Allah, et la terre la plus aimée d'Allah. Si je n'avais pas été contraint de te quitter, je ne t'aurais jamais quittée." (Rapporté par At-Tirmidhi et authentifié par Al-Albani)
</blockquote>

<h3>2. La prière multipliée à 100 000 dans la Mosquée Sacrée</h3>
<p>L'acte d'adoration le plus fondamental et accessible à La Mecque est la prière obligatoire ou surérogatoire. La récompense y est inestimable :</p>
<blockquote>
  "Une prière dans ma mosquée-ci [à Médine] est meilleure que mille prières ailleurs, sauf dans la Mosquée Sacrée [de La Mecque]. Et une prière dans la Mosquée Sacrée est meilleure que cent mille prières ailleurs." (Rapporté par l'Imam Ahmad et Ibn Majah, authentifié par Al-Busiri et Al-Albani)
</blockquote>
<p>Cela signifie qu'une seule prière accomplie au Haram de La Mecque équivaut spirituellement à plus de 54 ans de prières quotidiennes accomplies en dehors de ce lieu sacré.</p>

<h3>3. Le Tawaf : Une adoration exclusive et purificatrice</h3>
<p>Le Tawaf (les sept tours autour de la Kaaba) est une adoration que l'on ne peut accomplir nulle part ailleurs sur Terre. Ses mérites sont immenses :</p>
<ul>
  <li><strong>Équivalence à l'affranchissement d'un esclave :</strong><br>
    Le Prophète (SWS) a dit : "Quiconque fait le Tawaf autour de la Maison en faisant sept tours complets sans prononcer de paroles inutiles, c'est comme s'il avait affranchi un esclave." (Rapporté par An-Nasa'i et authentifié par Al-Albani)
  </li>
  <li><strong>Des récompenses à chaque pas :</strong><br>
    Le Prophète (SWS) a affirmé : "Il ne pose pas un pied et ne lève pas l'autre sans qu'Allah ne lui écrive pour cela une bonne action, lui efface un péché et l'élève d'un degré." (Rapporté par At-Tirmidhi)
  </li>
  <li><strong>L'effacement des péchets aux Coins Sacrés :</strong><br>
    Le Messager d'Allah (SWS) a enseigné : "Certes, passer la main sur la Pierre Noire et le Coin Yéménite efface complètement les péchés." (Rapporté par At-Tirmidhi, authentifié par Al-Albani)
  </li>
</ul>

<h3>4. Les mérites de l'eau bénite de Zamzam</h3>
<p>Boire l'eau de Zamzam sur place avec une intention de guérison, de pardon ou d'apprentissage est vivement recommandé. Le Prophète (SWS) a dit :</p>
<blockquote>
  "L'eau de Zamzam est utile à tout ce pour quoi elle a été bue." (Rapporté par Ibn Majah et authentifié par Al-Albani)
</blockquote>
<p>Il a également été rapporté dans le Sahih de l'Imam Muslim que le Prophète a dit au sujet de Zamzam :</p>
<blockquote>
  "Elle est une nourriture qui rassasie et une guérison pour les maladies."
</blockquote>

<h3>5. La Omra durant le Ramadan : Équivalente à un Hajj avec le Prophète (SWS)</h3>
<p>Accomplir la Omra à La Mecque durant le mois béni de Ramadan détient une valeur spirituelle équivalente au grand pèlerinage :</p>
<blockquote>
  "Une Omra accomplie durant le mois de Ramadan équivaut à un Hajj [dans une autre version : à un Hajj en ma compagnie]." (Sahih Al-Bukhari & Muslim)
</blockquote>
<p>Bien que cela ne dispense pas de l'obligation d'accomplir le Hajj prescrit une fois dans sa vie pour celui qui en a les moyens, la récompense est immense et égale à celle du Hajj accompli aux côtés du Prophète.</p>

<h3>Conclusion : Maximiser son temps à La Mecque</h3>
<p>Chaque minute passée à La Mecque doit être mise à profit pour multiplier les adorations : prières, Tawafs surérogatoires, récitation du Coran, évocations (Dhikr) et aumônes. C'est un trésor spirituel à préserver avec la plus grande piété, tout en veillant à éviter les comportements futiles ou les péchés qui, bien qu'ils ne soient pas multipliés en nombre, revêtent une gravité d'autant plus grande sur cette terre sacrée.</p>`,
    status: "published",
    imageUrl: "/la-voix-du-pelerin/assets/spiritual_prep.png",
    publishedAt: "2026-07-20T03:00:00.000Z"
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
    // If already seeded, check if we need to update/reset to get the latest articles
    const existing = localStorage.getItem(ARTICLES_KEY);
    const hasOldNumber = existing && existing.includes("+33 7 52 28 08 90");
    if (!existing || JSON.parse(existing).length < SEED_ARTICLES.length || JSON.parse(existing)[0].content.length < 1000 || hasOldNumber) {
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
