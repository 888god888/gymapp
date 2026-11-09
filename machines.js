// v11: append-only machine catalogue. Original part/index links remain unchanged.
'use strict';
(() => {
  const G = window.GYM_GUIDES;
  const manual = 'https://support.lifefitness.com/hc/en-us/articles/360043013933-Life-Fitness-Insignia-Series-Strength-Owner-s-Manual';
  const smithSource = 'https://support.lifefitness.com/hc/en-us/articles/38587673062295-Life-Fitness-SSM-Signature-Smith-Machine-Owner-s-Manual';
  const db = 'https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';
  const copy = (id, patch) => ({...JSON.parse(JSON.stringify(G[id])), ...patch});
  const machineChecks = (a,b,c) => [a,b,c];
  function add(part, id, n, q, m, photoId, recognize, machineTip, guide, options = {}) {
    const {eq='固定式訓練機', equipment='machine', aliases=[], source=manual, loading='依機型插銷／掛片'} = options;
    const x = {id,n,q,m,eq,equipment,photoId,photoName:photoId?.replaceAll('_',' ') || '',recognize,machineTip,loading,aliases,
      cue:guide.checklist[1], guide, added:'2026-11-09',
      s:[...guide.setup,guide.position,guide.drive,guide.limit,guide.return,guide.finish],
      t:[guide.breathing,guide.tempo],w:guide.corrections.map(c=>c.problem),
      sources:[{label:'器械／動作參考（機型依現場說明）',url:source}]
    };
    window.GYM_DATA.find(p=>p.k===part).x.push(x);
    G[id]=guide;
  }
  add('chest','Leverage_Incline_Chest_Press','上斜推胸機（掛片式）','Plate-Loaded Incline Chest Press','上胸、三頭、前三角','Leverage_Incline_Chest_Press',
    '坐在向後傾斜的靠背上，胸側有兩支向前上方推的獨立握把，兩側可掛槓片。','先調座椅，讓起始把手約在上胸旁；掛片重量只適合記錄同一台機器，不直接等同啞鈴或槓鈴重量。',
    copy('Leverage_Chest_Press',{
      setup:['先空載試推並調座椅，使起始把手約在上胸兩側；確認左右支臂的起點不扯肩。','左右對稱掛片，依機型使用鎖扣；若有腳踏助力或起始調整，先確認進出方式。'],
      position:'上背、臀部貼墊、雙腳踩地，手腕大致對準前臂，手肘自然略在身前。',
      drive:'把兩支握把沿機器軌道向前上方推，左右同步；肩頭不往前頂，也不讓握把互撞。',
      limit:'回放到肩前側舒適、背臀仍貼墊的位置；握把不用被壓到身後才算完整。',
      finish:'控制兩側支臂回到原本的支架或停止點，確定固定後再鬆手；卸片時確認器械沒有承載身體。',
      checklist:machineChecks('座椅與起始位置已空載試過。','左右握把能同步、肩前側不被拉扯。','支臂能安全放回，兩側掛片對稱。'),
      corrections:[{problem:'推到一半腰拱起、臀部離墊',fix:'先減重、重新調椅高與起始深度，不靠後仰改變機器軌道。'},{problem:'左右支臂明顯不同步',fix:'確認左右掛片一致並減重，讓較弱側能控制，勿用強側猛衝。'}]
    }),{eq:'上斜推胸機／Hammer 類掛片機',loading:'掛片式',aliases:['悍馬上胸','上胸推舉機','incline press'],source:db+'Leverage_Incline_Chest_Press.json'});
  add('chest','Smith_Machine_Bench_Press','史密斯臥推','Smith Machine Bench Press','胸大肌、三頭、前三角','Smith_Machine_Bench_Press',
    '槓鈴固定在兩側導軌上，轉動槓桿可掛回掛鉤；需把平板椅放到槓下。','先用空槓確認導軌方向、長凳位置與雙側安全擋。不同史密斯的空槓配重和傾斜角不同，不當成自由槓同重。',
    copy('Barbell_Bench_Press_-_Medium_Grip',{
      setup:['依現場機台說明確認站／躺的方向、旋轉解鎖方式；兩側安全擋設同高，先測試能保護胸頸。','移動長凳到空槓下放時落在胸部舒適位置；椅腳固定不滑，上背與臀部貼穩、腳踩地。'],
      position:'拇指環握，底端前臂大致在槓下；先伸肘承重，再依機台方向旋轉解鎖。',
      drive:'沿固定導軌平順下放，再推回；身體不跟著滑動去勉強配合不合適的軌道。',
      limit:'下放到肩部舒適且安全擋可保護的位置即可；導軌若迫使肩部不舒服，重設長凳或換機器。',
      finish:'推到可掛回高度，依機台方向轉槓，確認左右掛鉤均掛妥，再慢慢卸下手部力量確認固定後離椅。',
      checklist:machineChecks('導軌方向、解鎖與回掛已用空槓測試。','長凳固定，最低點肩部舒適。','雙側安全擋同高且能保護胸頸。'),
      corrections:[{problem:'槓被導軌帶往頸部或肩膀夾痛',fix:'先回掛，重設長凳前後位置與握距；無法調到舒服就換推胸機。'},{problem:'以為轉一下就掛好，準備直接鬆手',fix:'每次確認雙邊掛鉤均到位，再慢慢卸力測試，不跳過固定確認。'}]
    }),{equipment:'smith',eq:'史密斯機＋平板椅',loading:'導軌＋掛片',aliases:['smith bench','固定槓臥推'],source:smithSource});
  add('back','M_Lever_Pulldown','獨立握把下拉機','Lever Lat Pulldown','背闊肌、上背、二頭',null,
    '座椅上方有左右獨立的弧形拉臂與握把，常附大腿壓墊；不同於接一支長槓的高位下拉。','先確認是獨立拉臂機型；座位太低、把手太遠時不要跳起猛拉，先調座椅或請現場人員示範進入方式。',
    copy('Wide-Grip_Lat_Pulldown',{
      setup:['調座椅與大腿墊，讓雙腳有支撐、上舉時能安全取得左右握把。','插銷固定或左右對稱掛片，輕負重先試機器軌道與握法。'],
      position:'軀幹保持穩定，依把手形狀採舒適握法；肩胛可自然隨上舉移動。',
      drive:'手肘向身體兩側下方帶動左右拉臂，握把朝上胸旁靠近；不要用身體向後倒拉起負重。',
      limit:'到手肘接近身側、軀幹仍穩定就回放，不為了拉到底硬把肩膀往前頂。',
      finish:'控制拉臂回起點、確認負重停止，再依安全踏階或座位方式退出；不突然放掉握把。',
      checklist:machineChecks('腿墊固定、左右把手能安全取得。','左右拉臂同步，軀幹不後仰甩動。','回放到手臂上舉時仍能控制。'),
      corrections:[{problem:'手肘拉不到身側就開始後仰',fix:'降低負重，終點設在可控制處，不用後躺補行程。'},{problem:'一側拉臂先落到底',fix:'確認左右掛片相同，再減重同步拉回；不讓一側撞停。'}]
    }),{eq:'獨立拉臂式下拉機',aliases:['悍馬下拉','機械下拉','lever pulldown']});
  add('back','Leverage_High_Row','高位划船機','Plate-Loaded High Row','背闊肌、上背、後肩、二頭','Leverage_High_Row',
    '坐姿胸前通常有胸墊，握把位於前上方，拉臂沿斜向下後方移動。','高位划船是斜向拉回，與垂直下拉、水平划船的路徑不同；先讓胸墊支撐身體，勿拿自由划船影片代用。',
    copy('X_Chest_Supported_Row',{
      setup:['調座椅，胸口可貼穩胸墊且雙手能取得前上方握把；若有腿墊也一併固定。','左右對稱掛片或固定插銷，以輕重量試斜向拉回的路徑。'],
      position:'腳踩穩、胸部保持貼墊，腹部有張力，頭頸不向前探。',
      drive:'手肘由前上方向後下方帶，握把拉向胸腹兩側；胸不離墊，不用抬頭湊高度。',
      limit:'拉到肩部舒服、胸仍貼墊的位置就停；不硬把肘部拉到身後極限。',
      finish:'控制拉臂回前上方的停止點，確認負重穩定才放手與起身。',
      checklist:machineChecks('胸墊與座椅位置合適，能安全拿到握把。','拉回時胸不離墊、頭頸不前伸。','左右負重一致、回放不撞停。'),
      corrections:[{problem:'胸口離墊、腰往後拱',fix:'降低重量並調座位，讓胸部全程有穩定支撐。'},{problem:'當成肩推，手肘一路向上抬',fix:'重新看機器箭頭，讓手肘順著前上到後下的拉回軌道。'}]
    }),{eq:'高位划船機／掛片式',aliases:['悍馬高拉','斜向划船','high row'],source:'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-high-row'});
  add('back','Lying_T-Bar_Row','胸靠 T 槓划船機','Chest-Supported T-Bar Row','中上背、背闊肌、後肩、二頭','Lying_T-Bar_Row',
    '胸部趴在傾斜胸墊上，腳踩踏板，前方 T 槓拉臂有握把與掛片位置。','這是胸靠墊版本；與站姿地雷管 T 槓不同，要先確認胸墊高度、踏板與支臂回掛點。',
    copy('X_Chest_Supported_Row',{
      setup:['依機型調胸墊／踏板，讓胸部貼墊、雙腳踩穩，雙手能拿到握把。','確認掛片固定與支臂解鎖、回掛方式，先空載試一次。'],
      position:'胸廓貼穩墊面，頭頸順著軀幹，手臂自然伸向握把；不為搆把手拉長頸部。',
      drive:'手肘向後帶握把靠近下胸至上腹，肩胛自然靠近；保持胸部支撐，不用起身彈槓。',
      limit:'到肩膀不前頂、胸仍貼墊的位置；不以槓片撞到墊子當作完成標準。',
      finish:'控制回放並將支臂放回原支架／掛點，確定固定再離開胸墊，卸片前器械不得承重。',
      checklist:machineChecks('胸墊、踏板與回掛點已確認。','胸部不離墊，頸部保持自然。','能控制把支臂放回原來停止點。'),
      corrections:[{problem:'胸離墊、整個人往後彈',fix:'減重，讓握把回到能以胸墊支撐的行程。'},{problem:'最後一下回不了掛點',fix:'先請現場人員協助並減重，重新練熟空載回掛方式。'}]
    }),{eq:'胸靠式 T 槓划船機',aliases:['胸托T槓','lying t bar'],source:db+'Lying_T-Bar_Row.json'});
  add('back','M_Assisted_Pullup','輔助引體向上機','Assisted Pull-Up Machine','背闊肌、上背、二頭',null,
    '高處有引體握把，下方有能上下移動的跪墊或腳踏板，旁邊接配重片。','多數配重式輔助機「插得越重，幫你托得越多，動作越容易」。先看機台圖示確認，這不是把配重當成你拉起的重量。',
    copy('Pullups',{
      setup:['先看機台說明確認配重的輔助方向，選足以慢速控制的輔助量，不先挑最小格。','握把、固定台階與活動跪墊分清楚；依機台程序先握穩，再把膝或腳放上活動墊。'],
      position:'膝／腳留在指定活動墊上，雙手穩握，腹部有張力；身體不懸在墊外側。',
      drive:'從穩定伸臂位置開始，讓手肘向下帶身體向握把靠近，跪墊隨身體平順移動。',
      limit:'拉到頸部自然且能控制的位置；不伸下巴、不甩腿，下端也不突然吊落。',
      finish:'控制降到機台指定下機位置，雙手握穩扶手，依圖示把腳移回固定台階再解除跪墊支撐；不突然跳離，避免活動墊彈起。',
      checklist:machineChecks('已確認輔助方向，選到能慢速回程的輔助量。','膝／腳在指定墊位，身體沒有擺盪。','知道固定台階在哪，能按順序下機。'),
      corrections:[{problem:'配重越減越難，誤以為是機器故障',fix:'此類通常是減少了輔助；加回適當輔助重量，依機台說明確認。'},{problem:'離開跪墊時墊子突然彈上去',fix:'先停止，請現場人員示範上下機；全程握穩，不從活動墊跳離。'}],
      easier:'增加適當輔助量，或先改高位下拉；目標是上拉和下降都能控制。'
    }),{eq:'輔助引體／雙槓二合一機',loading:'配重提供輔助',aliases:['助力引體','輔助單槓','assisted chin']});
  add('back','M_Back_Extension','坐姿背伸展機','Seated Back Extension Machine','豎脊肌、臀部（依機型）',null,
    '坐姿固定骨盆，背後有阻力墊，軀幹從略前傾向後伸展；不是趴在羅馬椅上。','不同機型固定骨盆與轉軸的方式差異大；先照圖示設定，不把羅馬椅髖鉸鏈的幅度直接套上。',
    copy('Hyperextensions_Back_Extensions',{
      setup:['依機台圖示調椅背、腳踏、骨盆固定與起始角；後背接觸指定墊位，不讓墊緣壓頸部。','從輕負重與保守起始角度開始，先試能否平順回到直立。'],
      position:'雙腳與骨盆固定，頭頸自然，雙手扶握把；保持可控制的軀幹張力。',
      drive:'依機器軌道將軀幹從略前傾伸展回接近自然直立，動作平順；不仰頭猛撞背墊。',
      limit:'直立附近即可，不為了拉滿機器刻意向後大幅拗腰；活動範圍以機台圖示及舒適度為準。',
      return:'控制沿原路略前傾，不讓配重把身體突然折下，骨盆保持固定。',
      finish:'回到機台停止位置，配重落穩後再解除固定、鬆手起身。',
      breathing:'伸展回正時吐氣，控制回程吸氣，不靠長時間憋氣撐負重。',
      checklist:machineChecks('骨盆、腳與背墊位置依該機台設定。','只到可控制的自然直立附近。','回程平順，腰部沒有擠壓或刺痛。'),
      corrections:[{problem:'頂端拗得很高、下背擠壓',fix:'縮小後伸幅度並減重，到直立附近就停；仍不適就結束。'},{problem:'骨盆滑走、用腿蹬起身',fix:'停止調整座椅與固定墊，使用更輕負重重新測試。'}],easier:'先用最輕負重與小行程；無法找到舒適設定就選其他背部穩定練習。'
    }),{eq:'坐姿背伸展機／Lower Back',aliases:['下背機','背部伸展機','lower back']});
  add('arm','Machine_Bicep_Curl','二頭彎舉機','Machine Biceps Curl','二頭肌、肱肌、前臂','Machine_Bicep_Curl',
    '坐姿，上臂靠在前方斜墊，握住會隨屈肘上轉的把手；旁邊可選配重。','調椅高讓上臂穩貼墊、肘關節大致對準機器轉軸；不要為了搆握把把肩膀頂到耳旁。',
    copy('Preacher_Curl',{
      setup:['調椅高讓上臂貼穩墊面、腋下不被墊緣頂壓，肘關節大致對準轉軸。','選輕配重，調把手或起始角讓手腕舒服，雙腳踩地。'],
      position:'上臂留在墊上，手腕與前臂大致同線，肩膀放在自然位置。',
      drive:'屈肘讓握把靠近肩前，前臂移動、上臂不離墊；不要整個身體往後拉。',
      limit:'彎到可控制處就回放；底端不突然鎖直，也不讓配重把肘部拉到過伸。',
      finish:'控制握把回起點，配重完全落穩後才鬆手、把上臂移出墊面。',
      checklist:machineChecks('上臂貼墊、肘部大致對軸。','手腕自然、肩膀沒有向前頂。','底端能慢停，不被配重扯直。'),
      corrections:[{problem:'上臂離墊、身體往後倒',fix:'減重並重調椅高，回到只需屈肘就能帶動握把的位置。'},{problem:'手腕被固定把手扭痛',fix:'調把手或座椅並減重；機型無法配合時改滑輪或啞鈴。'}]
    }),{eq:'二頭彎舉機／機械牧師椅',aliases:['二頭機','二頭肌訓練機','biceps curl'],source:'https://shop.lifefitness.com/products/insignia-series-biceps-curl'});
  add('arm','Machine_Triceps_Extension','三頭伸展機（上臂靠墊）','Machine Triceps Extension','三頭肌','Machine_Triceps_Extension',
    '坐姿、上臂靠前方墊子，握把以手肘伸直的方式向前下方推；不是雙側把手下壓的坐姿雙槓機。','先確認肘軸與上臂墊的位置；此機練的是伸肘，肩膀不必前後甩。',
    copy('Triceps_Pushdown',{
      setup:['調座椅讓上臂貼穩指定墊位、肘部大致對準轉軸，腳踩地。','先用輕配重，確認起始屈肘角度與握把位置不扯手腕或肩膀。'],
      position:'上臂有完整支撐，背臀穩定，手腕自然，不用胸口壓住把手。',
      drive:'保持上臂大致穩定，以伸肘把握把沿機台軌道推遠；手肘是主要開合的關節。',
      limit:'伸到肘部舒適、能控制的範圍就停，不猛撞終點或用力過伸。',
      return:'慢慢屈肘回放，上臂保持貼墊，不讓負重把肩膀向前拉走。',
      finish:'讓配重慢慢落穩，再鬆握把並移開上臂、起身。',
      checklist:machineChecks('上臂貼墊、肘部大致對軸。','主要是屈伸肘，上臂不大幅移動。','伸直終點不撞擊，肘關節舒服。'),
      corrections:[{problem:'身體前後甩、變成用肩膀推',fix:'減輕重量，重設座椅與起始角，讓上臂有支撐。'},{problem:'終點肘部刺痛或猛撞',fix:'立刻減少重量與幅度，不硬鎖肘；持續疼痛就停止。'}]
    }),{eq:'三頭肌伸展機／Triceps Extension',aliases:['三頭機','肘伸展機'],source:'https://shop.lifefitness.com/products/insignia-series-triceps-extension'});
  add('arm','Dip_Machine','坐姿三頭下壓機','Seated Dip / Triceps Press Machine','三頭、胸、前三角','Dip_Machine',
    '坐在椅上，身體兩側各一支握把，將握把往下壓；身體不會像輔助雙槓一樣上下升降。','這台是「配重越大通常越難」的下壓機，與輔助引體／雙槓機的配重方向不同。',
    copy('Triceps_Pushdown',{
      setup:['調座椅與握把寬度，起始手肘自然彎曲、肩膀不被向後扯。','固定插銷或對稱掛片，腳踩地、背臀貼穩；先看是否有束帶或起始助力。'],
      position:'手肘沿身側舒適方向，手腕自然，軀幹不靠往前趴來壓重量。',
      drive:'以伸肘把兩側握把向下推，手臂自然伸展，身體留在座椅上。',
      limit:'到手肘舒適伸展位置即可，不猛撞過伸；回程不讓肩膀被把手抬高拉走。',
      return:'慢慢屈肘讓把手上升，肩部與軀幹大致穩定，不整個人跟著浮起。',
      finish:'控制配重落穩或支臂回起點，確定固定後才鬆手、解除束帶並起身。',
      checklist:machineChecks('已分清坐姿下壓與輔助雙槓機。','推時背臀穩定，不往前趴。','回程肩膀不被拉走，兩側同步。'),
      corrections:[{problem:'用整個上半身往下壓',fix:'減重，維持座椅支撐，主要以伸肘下壓完成。'},{problem:'回放太深，肩前側被拉扯',fix:'縮短回程並重調座椅與握把寬度，不追求肘部彎得越深越好。'}]
    }),{eq:'坐姿雙槓下壓機／Triceps Press',aliases:['坐式雙槓','三頭下壓機','seated dip'],source:db+'Dip_Machine.json'});
  add('arm','M_Assisted_Dip','輔助雙槓臂屈伸機','Assisted Dip Machine','三頭、胸、前三角',null,
    '雙手撐在身側雙槓，膝／腳放活動輔助墊，身體隨動作上下移動；常和輔助引體共用一台。','多數配重越大提供越多輔助，動作越容易；與坐姿三頭下壓機相反。上下機先辨認固定台階與活動墊。',
    copy('Dips_-_Triceps_Version',{
      setup:['看圖示確認輔助方向，選足以控制下放的輔助量，先確認握把寬度。','握穩扶手，依機台程序把膝／腳移到活動墊；不要踩在活動墊邊緣。'],
      position:'在輔助墊托住的情況穩定撐起，軀幹可自然微前傾，頭頸自然。',
      drive:'控制屈肘讓身體下降，再推雙槓回升；肩膀不突然陷下、腿不甩動。',
      limit:'下放到肩部仍舒服且能平順推回的位置；不為了肘到固定角度硬壓深度。',
      finish:'回到機台指定退出位置，握穩支架，把腳移回固定台階後再解除活動墊支撐；不跳離活動墊。',
      checklist:machineChecks('知道此台配重是輔助量，且上下機順序清楚。','肩前側舒服，下降中途能停住。','跪墊平順移動，身體沒有甩動。'),
      corrections:[{problem:'下放太快、底端撐不住',fix:'增加適當輔助並縮短幅度，先練慢速下降與推回。'},{problem:'把輔助配重當成加重一直減少',fix:'重新確認機台標示；此類減少配重通常會更難，先增加輔助練穩。'}],
      easier:'增加適當輔助量與縮短深度；仍無法控制可先用坐姿三頭下壓機。'
    }),{eq:'輔助雙槓／引體二合一機',loading:'配重提供輔助',aliases:['助力雙槓','assisted dip']});
  add('abs','M_Rotary_Torso','坐姿轉體機','Seated Rotary Torso Machine','腹斜肌、軀幹穩定肌',null,
    '坐姿固定腿與軀幹，胸肩靠墊或座位會繞垂直軸旋轉，通常能設定左右起始角度。','有些機型轉上半身，有些轉座位／骨盆，先依該機台圖示固定；不要把站姿滑輪轉體直接套用。',{
      setup:['先看機台圖示確認哪一部分旋轉，調座椅、腿墊與胸肩支撐。','以很輕重量與較小起始轉角試做，左右各一組分開設定；不在承重時切換旋轉方向。'],
      position:'腳與腿固定，胸肩貼指定支撐，頭頸自然；不要拿手猛拉握把。',
      drive:'沿機器指定路徑慢慢轉向另一側，讓軀幹與支撐部位保持接觸；動作來自受控旋轉。',
      limit:'使用能保持骨盆／胸廓支撐且無腰部扭痛的範圍，不追求旋到最遠。',
      return:'慢慢回到起點，不靠終點反彈；配重不把身體突然拉回。',
      finish:'回到停止位置、配重落穩，再調左右方向或解除腿墊起身。',
      breathing:'轉出時吐氣，回程吸氣，持續呼吸、不硬憋氣。',tempo:'轉出約 1–2 秒、回程約 2–3 秒，兩側終點先停穩。',
      feel:'腹斜肌與軀幹肌群參與；腰部扭痛不是訓練目標，也不能用此動作局部消掉腰脂肪。',
      checklist:machineChecks('已確認此機型轉上半身還是座位，固定方式正確。','轉角保守、腰部沒有扭痛。','回程能慢慢控制，不靠彈震。'),
      corrections:[{problem:'用手拉握把、肩膀脫離靠墊',fix:'減重並重設靠墊位置，維持接觸再小幅度旋轉。'},{problem:'轉到極限才有感，腰越轉越不舒服',fix:'縮小角度與重量；仍不適改抗旋轉推或其他穩定訓練。'}],easier:'用最輕配重、小起始轉角；無法舒適固定就改較簡單的抗旋轉練習。'
    },{eq:'坐式旋轉軀幹機／Rotary Torso',aliases:['轉腰機','腹斜肌機','旋轉機'],source:'https://shop.lifefitness.com/products/insignia-series-torso-rotation'});
  add('leg','Lying_Leg_Curls','俯臥腿彎舉機','Lying Leg Curl','腿後側、小腿','Lying_Leg_Curls',
    '面朝下趴在長墊上，小腿後方有滾筒，以屈膝把腳跟帶向臀部。','膝關節大致對機器轉軸，滾筒壓在小腿後側下端、腳踝上方；不是壓在腳跟或阿基里斯腱上。',
    copy('Seated_Leg_Curl',{
      setup:['調小腿滾筒長度，膝關節大致對轉軸，髖部與大腿有墊面支撐。','俯臥後握扶手，滾筒放小腿後側下端、腳踝上方，先用輕重量試舒適行程。'],
      position:'骨盆與大腿貼墊，腹部維持張力，頭頸順著軀幹；不要抬頭拗腰。',
      drive:'屈膝把滾筒帶向臀部方向，左右同步，骨盆不抬起。',
      limit:'到仍能保持大腿與骨盆貼墊的位置即可；不用腳跟碰臀，回程也不被配重扯直。',
      return:'慢慢伸膝回到可控制的起點，滾筒不滑向腳跟，骨盆保持支撐。',
      finish:'配重落穩後先把小腿移開滾筒，再用手支撐安全起身。',
      checklist:machineChecks('膝對軸、滾筒在小腿後側下端。','屈膝時骨盆與大腿不離墊。','回程可控制，不抽筋或夾痛。'),
      corrections:[{problem:'抬臀、腰拱起才彎得動',fix:'減輕重量、縮小屈膝幅度，先維持骨盆貼墊。'},{problem:'滾筒滑到腳跟或腳踝壓痛',fix:'先停止，重新調滾筒長度與俯臥位置，不硬頂著做。'}]
    }),{eq:'趴式腿彎舉機／Lying Leg Curl',aliases:['俯臥腿後勾','腿後勾機','趴式腿勾'],source:'https://www.nasm.org/resource-center/exercise-library/lying-leg-curl'});
  add('leg','Standing_Leg_Curl','站姿單腿彎舉機','Standing Leg Curl','腿後側、小腿','Standing_Leg_Curl',
    '站姿或半跪姿靠支撐墊，一次一條腿把小腿往後勾，另一腿在固定踏板上。','支撐腿、活動腿與胸／大腿靠墊的位置依機型不同；先確認轉軸與腳墊，不把滑輪腳踝帶版當成同一種。',
    copy('Seated_Leg_Curl',{
      setup:['依機型讓軀幹或大腿貼指定墊面，支撐腳踩穩踏板、雙手握扶手。','調活動腿的滾筒在小腿後側下端，膝大致對轉軸；選輕配重。'],
      position:'骨盆朝前並穩定，活動腿上段留在支撐位，頭頸自然；身體前傾量依墊位。',
      drive:'一次一腿屈膝，把腳跟帶向臀部方向；大腿不往後踢、支撐腿不彈跳。',
      limit:'彎到骨盆仍穩定、腿後側可控制的位置即可，不要求腳跟碰臀。',
      return:'慢慢伸膝回起點，上身仍貼穩支撐，不讓滾筒把膝蓋猛拉直。',
      finish:'配重落穩，先穩住支撐腳再移開活動腿；換側重調墊位，雙側都練。',
      checklist:machineChecks('支撐腳踩穩、活動腿膝軸與滾筒已調好。','骨盆不旋轉，大腿不向後踢。','兩側以各自可控制的重量完成。'),
      corrections:[{problem:'變成整條腿向後踢、屁股旋開',fix:'減重並穩住骨盆，維持大腿位置，只讓膝關節屈伸。'},{problem:'站不穩、用支撐腿跳起',fix:'停止並重設踏板與胸墊，改俯臥或坐姿腿彎舉也可以。'}]
    }),{eq:'站姿／半跪式單腿腿彎舉機',aliases:['單腳腿後勾','站姿腿勾'],source:db+'Standing_Leg_Curl.json'});
  function hipGuide(direction) {
    const out=direction==='out';
    return {
      setup:[`先選 ${out?'外展 Abduction':'內收 Adduction'} 模式，調起始角度為保守範圍；墊子放大腿${out?'外':'內'}側指定接觸面。`,'背與臀部貼座椅，雙腳放腳踏、握扶手；先以輕重量測試支臂與退出拉桿。'],
      position:'骨盆保持穩定，背部有支撐，膝蓋跟著支臂移動；不要用手壓膝蓋幫忙。',
      drive:out?'雙側大腿向外打開推動墊子，左右平順同步；不是靠膝蓋扭轉或用腳尖用力掰。':'雙側大腿向中間靠攏推動墊子，平順合回；不靠上身前趴或膝蓋互撞。',
      limit:out?'只打開到髖部舒服、骨盆不旋轉的位置，不硬追最大張開角度。':'起點不要被迫劈太開；合攏到可控制處即可，不必夾到支臂撞停。',
      return:out?'慢慢向內合回起點，保持張力，不讓配重把雙腿突然拉回。':'控制向外打開回起點，內側有張力但不撕扯；不要在最外側彈震。',
      finish:'讓配重落穩，依機台拉桿或助力機構解除支臂，雙腿可自由移動後再起身；不要硬跨過承重墊。',
      breathing:`${out?'打開':'合攏'}時吐氣、回程吸氣，維持正常呼吸。`,tempo:'出力約 1–2 秒、回程約 2–3 秒，終點短暫停穩、不彈震。',
      feel:out?'臀外側與髖外展肌參與；不需大幅前趴追求更痠，也不代表能局部瘦臀外側。':'大腿內側內收肌參與；起始伸展感應可控制，不以拉得越開越有效。',
      checklist:machineChecks(`模式為${out?'外展，墊在大腿外側':'內收，墊在大腿內側'}。`,'起始角度保守、雙腳有支撐。','骨盆穩定、回程不被配重拉走。'),
      corrections:[{problem:out?'上身往前趴、屁股離椅':'起點張太開、內側被拉扯',fix:out?'減重、讓背臀有穩定支撐；先不要用前趴姿勢改變動作。':'停止重設較小起始角度與較輕重量，不硬撐最大張開位置。'},
        {problem:'墊子接觸位置壓膝不舒服',fix:'停止調座椅、腳踏與墊子位置，讓大腿指定部位承力；調不到舒服就換機型。'}],
      easier:'最輕配重、較小幅度，先確認能慢慢往返且進出器材順暢。'
    };
  }
  add('leg','Thigh_Abductor','髖外展機（大腿向外開）','Seated Hip Abduction','臀中肌、臀小肌、其他髖外展肌','Thigh_Abductor',
    '坐姿，雙腿靠在大腿外側墊上，往外打開支臂；常與內收共用一台。','外展＝向外打開，墊通常在大腿外側。切換二合一機的模式與起始角度後，要確認鎖定再承重。',hipGuide('out'),
    {eq:'髖外展機／Abductor',aliases:['開腿機','外側臀','外展機'],source:'https://shop.lifefitness.com/products/insignia-series-hip-abductor-adductor-outlet'});
  add('leg','Thigh_Adductor','髖內收機（大腿向內合）','Seated Hip Adduction','大腿內側內收肌群','Thigh_Adductor',
    '坐姿，雙腿靠大腿內側墊，從打開位置向內合攏；常與外展共用一台。','內收＝向內合，墊通常在大腿內側。起點不需要張得很開，先選髖部舒適且能控制的角度。',hipGuide('in'),
    {eq:'髖內收機／Adductor',aliases:['夾腿機','內側大腿','內收機'],source:'https://shop.lifefitness.com/products/insignia-series-hip-abductor-adductor-outlet'});
  add('leg','M_Glute_Kickback','臀部後踢機','Glute Kickback Machine','臀大肌、腿後側',null,
    '站姿或胸部靠墊，一腳踩固定踏板，另一腳踩活動腳踏或靠腿墊向後推。','先依圖示確認腳掌／腿墊的施力位置；這台是髖伸展，不是腿彎舉，動作以大腿向後移為主。',
    copy('Barbell_Hip_Thrust',{
      setup:['調胸墊或扶手讓軀幹有支撐，支撐腳完整踩穩，依機型調活動腳踏。','輕重量試活動腿起點，不讓腳踏把髖部拉到不舒服位置；骨盆保持朝前。'],
      position:'上身靠穩支撐、腹部收緊，支撐膝自然放鬆，活動腳與踏板維持可靠接觸。',
      drive:'以髖伸展把大腿向後帶，腳踏順軌道後移；膝蓋彎度依機型自然保持，不只勾小腿。',
      limit:'到骨盆仍朝前、腰不反弓的位置就停，不以踢得高作標準。',
      return:'慢慢讓活動腿回到起點，不讓配重把腳拉離踏板，也不讓骨盆旋開。',
      finish:'配重落穩、活動腳回安全位置後才移開，再換側重設；手仍扶穩才下踏板。',
      breathing:'向後推時吐氣、回程吸氣，維持腹部張力。',
      checklist:machineChecks('支撐腳踩穩、活動踏板與靠墊位置已確認。','大腿向後移，骨盆不旋開。','頂端腰不反弓、腳不滑離踏板。'),
      corrections:[{problem:'踢越高腰越拱、下背擠壓',fix:'減重並減少後踢幅度，維持肋骨與骨盆穩定。'},{problem:'變成只勾小腿或骨盆轉開',fix:'用較小行程練髖伸展，讓大腿向後移，軀幹靠穩支撐。'}],easier:'用輕配重與短行程，或先練徒手臀橋；不需追高踢腿。'
    }),{eq:'固定式臀部後踢機／Glute',aliases:['後踢臀機','翹臀機','臀大肌機'],source:'https://shop.lifefitness.com/products/insignia-series-glute'});
  add('leg','M_Hip_Thrust','臀推機／臀橋機','Hip Thrust / Glute Drive Machine','臀大肌、大腿、腿後側',null,
    '上背靠墊、雙腳踩踏板，髖部有腰帶或壓墊，抬髖時帶動配重或掛片。','髖部壓墊／腰帶應落在機台指定的髖部位置，不壓腹部；先學會扣帶、解鎖與回鎖再加重。',
    copy('Barbell_Hip_Thrust',{
      setup:['依機型調上背墊、踏板與髖墊／腰帶，確認腰帶扣妥、壓墊不是壓腹部。','選輕負重，先試啟動踏桿或解鎖與回鎖方式；不要在未固定腰帶時承重。'],
      position:'上背穩靠墊，雙腳完整踩穩踏板、膝蓋大致朝腳尖方向，肋骨不外翻。',
      drive:'腳掌推踏板、髖部抬起，讓軀幹與大腿接近一直線；不是用腰把墊子拱高。',
      limit:'髖伸展到可控制的位置即可，頂端小腿接近垂直可作腳位起點，不硬套每台同角度。',
      return:'控制髖部下降，背部維持指定支撐、腰帶不滑動，膝蓋不內夾。',
      finish:'回到機台停止／上鎖位置，確認負重固定，才依順序解除腰帶或髖墊並退出。',
      checklist:machineChecks('腰帶／髖墊已固定在正確位置。','抬髖時腳掌不滑，腰不後拗。','回鎖程序已試過，卸重後才解腰帶。'),
      corrections:[{problem:'壓墊壓在腹部、腰帶滑動',fix:'停止並重設腰帶長度與髖墊位置，請現場人員協助確認機台使用法。'},{problem:'頂端下背擠壓、膝蓋內夾',fix:'減重與減少高度，調整腳位，保持肋骨與骨盆穩定。'}]
    }),{eq:'臀推機／臀橋機／Glute Drive',aliases:['booty builder','hip thrust machine','臀橋機'],source:'https://shop.lifefitness.com/products/insignia-series-glute-bridge'});
  add('leg','Calf_Press_On_The_Leg_Press_Machine','腿推機提踵','Leg Press Calf Raise','腓腸肌、比目魚肌','Calf_Press_On_The_Leg_Press_Machine',
    '在腿推機座位上，前腳掌踩踏板指定位置，透過腳踝上下帶動踏板；膝蓋角度大致不變。','只有機台說明允許且踏板能安全支撐前腳掌時才做；別在重負荷承重中冒險挪腳。能保留安全擋的機型先保留。',
    copy('Standing_Calf_Raises',{
      setup:['先確認這台腿推允許提踵、踏板不滑且有合適安全擋；不確定就改專用提踵機。','輕負重設定靠背與安全位置，依機台程序放好前腳掌，腳跟可在安全範圍移動，背臀貼墊。'],
      position:'膝蓋維持接近伸展但不猛鎖，前腳掌接觸可靠，腳踝不內外翻。',
      drive:'以前腳掌穩定推踏板，讓腳跟上提；膝蓋不反覆屈伸，不變成短行程腿推。',
      limit:'上提到腳踝穩定的高度，下降到舒適伸展；前腳掌不能滑出踏板或只剩腳趾抓邊。',
      return:'慢慢降腳跟，保持前腳掌接觸與膝部位置，不彈震、不硬拉阿基里斯腱。',
      finish:'依機台程序回安全停止／上鎖位置，確認負重固定才移動腳掌與離座。',
      checklist:machineChecks('已確認機台允許此用法，安全擋與腳位可控制。','前腳掌完整有支撐，不只腳趾抓邊。','膝蓋不反覆彎曲，腳踝無內外翻。'),
      corrections:[{problem:'前腳掌開始滑動或快掉出踏板',fix:'立即控制回安全停止位置；停止此版本，改專用提踵機，不在承重中硬挪腳。'},{problem:'變成小幅腿推、膝蓋一直動',fix:'減重並保持膝角大致固定，只練腳踝上下；做不到就換提踵機。'}],
      easier:'優先用專用提踵機，或在平地扶穩支架做徒手提踵。'
    }),{eq:'允許提踵的腿推機',aliases:['腿推小腿','腿推踮腳','calf press'],source:'https://www.nasm.org/resource-center/exercise-library/leg-press-calf-raise'});
  add('leg','Smith_Machine_Squat','史密斯深蹲','Smith Machine Squat','股四頭、臀部、腿後側','Smith_Machine_Squat',
    '槓鈴固定在垂直或斜向導軌，槓上有旋轉掛鉤與兩側可調安全擋。','先看導軌方向與機台說明調腳位，不套用「腳一定前伸多少公分」。安全擋兩側同高，先空槓測試最低點與回掛。',
    copy('Barbell_Squat',{
      setup:['把槓掛在能穩定取得的上背高度，雙側安全擋同高，空槓試解鎖、最低點與回鎖。','槓放上背肌肉避開頸椎，依導軌方向選能完整腳掌踩穩的腳位；不用大幅走離槓架。'],
      position:'握穩槓、軀幹有張力，站穩後伸膝承重再旋轉解鎖；頭頸自然。',
      drive:'沿固定導軌屈髖屈膝下蹲，再以腳掌推地站起；膝蓋大致跟著腳尖方向。',
      limit:'到腳掌穩定、骨盆與軀幹仍可控制的深度；膝可自然前移，不硬卡在腳尖後。',
      return:'每一下沿原路控制下降，不靠底端彈震；導軌讓姿勢不舒服時先停下調腳位或換機型。',
      finish:'站穩在可回掛位置，旋轉槓使雙側掛鉤就位，慢慢卸力確認固定，再離開槓下。',
      checklist:machineChecks('導軌方向、解鎖回掛與雙側安全擋已試過。','整個腳掌踩穩，膝蓋走向可控制。','最低點不失控，站起後可安全回掛。'),
      corrections:[{problem:'腳跟浮起或臀部被軌道推離',fix:'先回掛，以空槓微調腳位與深度；不要在承重中大幅換站位。'},{problem:'硬套固定腳位造成膝腰不適',fix:'依機台軌道與身體比例重設，不舒服就改腿推或其他能控制的深蹲。'}]
    }),{equipment:'smith',eq:'史密斯機',loading:'導軌＋掛片',aliases:['固定槓深蹲','smith squat'],source:smithSource});
  // Dedicated cable-driven stations remain machines; a cable transmission alone is not a cable crossover station.
  const old = Object.fromEntries(window.GYM_DATA.flatMap(p=>p.x).map(x=>[x.id,x]));
  ['Wide-Grip_Lat_Pulldown','Seated_Cable_Rows','X_Wide_Cable_Row','X_Close_Grip_Pulldown'].forEach(id=>{old[id].equipment='machine';});
  old['T-Bar_Row_with_Handle'].equipment='other';
  old.Hyperextensions_Back_Extensions.equipment='other';
  old.Thigh_Abductor.aliases.push('開腿');
  old.Thigh_Adductor.aliases.push('夾腿');
})();
