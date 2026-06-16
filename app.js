let provider;
let signer;
let account;

let usdt;
let nc;
let core;
let vault;
let binary;
let staking;

const C = window.APP_CONFIG;

// ======================
// Helpers
// ======================

function fmt(v, d = 18) {

try {

```
return Number(
  ethers.utils.formatUnits(v, d)
).toLocaleString(
  undefined,
  {
    maximumFractionDigits: 4
  }
);
```

} catch {

```
return "0";
```

}
}

function shortAddr(a) {

if (!a)
return "-";

return (
a.substring(0,6) +
"..." +
a.substring(a.length-4)
);
}

function pkgName(id){

if(Number(id)===1)
return "Small";

if(Number(id)===2)
return "Medium";

if(Number(id)===3)
return "Large";

return "None";
}

function rankName(id){

if(Number(id)===1)
return "Bronze";

if(Number(id)===2)
return "Silver";

if(Number(id)===3)
return "Gold";

return "None";
}

// ======================
// Page Navigation
// ======================

function showPage(id){

document
.querySelectorAll(".page")
.forEach(p=>{
p.classList.remove("active");
});

document
.getElementById(id)
.classList.add("active");
}

// ======================
// Network
// ======================

async function ensureBSC(){

const chainId =
await window.ethereum.request({
method:"eth_chainId"
});

if(
chainId === C.CHAIN_ID_HEX
){
return;
}

try{

```
await window.ethereum.request({
  method:
  "wallet_switchEthereumChain",
  params:[
    {
      chainId:
      C.CHAIN_ID_HEX
    }
  ]
});
```

}catch(err){

```
if(err.code===4902){

  await window.ethereum.request({

    method:
    "wallet_addEthereumChain",

    params:[{

      chainId:
      C.CHAIN_ID_HEX,

      chainName:
      C.CHAIN_NAME,

      nativeCurrency:{
        name:"BNB",
        symbol:"BNB",
        decimals:18
      },

      rpcUrls:[
        C.RPC_URL
      ],

      blockExplorerUrls:[
        C.BLOCK_EXPLORER
      ]

    }]
  });

}else{

  throw err;
}
```

}
}

// ======================
// Connect Wallet
// ======================

async function connectWallet(){

if(!window.ethereum){

```
alert(
  "Please install MetaMask or Bitget Wallet"
);

return;
```

}

await ensureBSC();

provider =
new ethers.providers.Web3Provider(
window.ethereum,
"any"
);

await provider.send(
"eth_requestAccounts",
[]
);

signer =
provider.getSigner();

account =
await signer.getAddress();

usdt =
new ethers.Contract(
C.USDT,
C.ERC20_ABI,
signer
);

nc =
new ethers.Contract(
C.NC,
C.ERC20_ABI,
signer
);

core =
new ethers.Contract(
C.CORE,
C.CORE_ABI,
signer
);

vault =
new ethers.Contract(
C.VAULT,
C.VAULT_ABI,
signer
);

binary =
new ethers.Contract(
C.BINARY,
C.BINARY_ABI,
signer
);

staking =
new ethers.Contract(
C.STAKING_V5,
C.STAKING_V5_ABI,
signer
);

document
.getElementById(
"walletAddress"
)
.innerText =
shortAddr(account);

document
.getElementById(
"connectBtn"
)
.innerText =
"Connected";

loadReferralLinks();

await loadDashboard();
}
// ======================
// Referral Links
// ======================

function loadReferralLinks(){

if(!account) return;

const base =
window.location.origin +
window.location.pathname;

const main =
base +
"?ref=" +
account;

const left =
base +
"?ref=" +
account +
"&side=left";

const right =
base +
"?ref=" +
account +
"&side=right";

document
.getElementById("refLink")
.value = main;

document
.getElementById("leftRefLink")
.value = left;

document
.getElementById("rightRefLink")
.value = right;
}

// ======================
// Copy Referral
// ======================

async function copyReferral(){

const txt =
document
.getElementById("refLink")
.value;

await navigator
.clipboard
.writeText(txt);

alert(
"Referral copied"
);
}

// ======================
// Dashboard
// ======================

async function loadDashboard(){

if(!account) return;

try{

```
// USDT

const usdtBal =
  await usdt.balanceOf(
    account
  );

document
  .getElementById(
    "usdtBalance"
  )
  .innerText =
  fmt(usdtBal);

// NC

const ncBal =
  await nc.balanceOf(
    account
  );

document
  .getElementById(
    "ncBalance"
  )
  .innerText =
  fmt(ncBal);

// USER

const u =
  await core.users(
    account
  );

document
  .getElementById(
    "myPackage"
  )
  .innerText =
  pkgName(u.pkg);

document
  .getElementById(
    "myRank"
  )
  .innerText =
  rankName(u.rank);

document
  .getElementById(
    "myDirects"
  )
  .innerText =
  u.directSmallOrMore;

// PACKAGE NC

const small =
  await core.smallNC();

const medium =
  await core.mediumNC();

const large =
  await core.largeNC();

document
  .getElementById(
    "smallNC"
  )
  .innerText =
  fmt(small) +
  " NC";

document
  .getElementById(
    "mediumNC"
  )
  .innerText =
  fmt(medium) +
  " NC";

document
  .getElementById(
    "largeNC"
  )
  .innerText =
  fmt(large) +
  " NC";

// Binary

const v =
  await binary
  .volumesOf(
    account
  );

document
  .getElementById(
    "leftVol"
  )
  .innerText =
  fmt(v.l);

document
  .getElementById(
    "rightVol"
  )
  .innerText =
  fmt(v.r);

document
  .getElementById(
    "pairVol"
  )
  .innerText =
  fmt(v.p);

document
  .getElementById(
    "binaryLeft"
  )
  .innerText =
  fmt(v.l);

document
  .getElementById(
    "binaryRight"
  )
  .innerText =
  fmt(v.r);

document
  .getElementById(
    "binaryPair"
  )
  .innerText =
  fmt(v.p);

// Vault

const claimUSDT =
  await vault
  .claimableUSDT(
    account
  );

document
  .getElementById(
    "claimUSDT"
  )
  .innerText =
  fmt(claimUSDT);

const claimNC =
  await vault
  .claimableDF(
    account
  );

document
  .getElementById(
    "claimNC"
  )
  .innerText =
  fmt(claimNC);

await loadStaking();
```

}catch(err){

```
console.error(err);

document
  .getElementById(
    "txStatus"
  )
  .innerText =
  err.message;
```

}
}
// ======================
// Status
// ======================

function setStatus(msg){

const el =
document.getElementById(
"txStatus"
);

if(el){
el.innerText = msg;
}
}

// ======================
// Approve USDT
// ======================

async function approveUSDT(pkgId){

if(!account){

```
alert(
  "Connect wallet first"
);

return;
```

}

try{

```
setStatus(
  "Approving USDT..."
);

const amount =
  await core.priceUSDT(
    pkgId
  );

const tx =
  await usdt.approve(
    C.CORE,
    amount
  );

await tx.wait();

setStatus(
  "Approve Success"
);
```

}catch(err){

```
console.error(err);

setStatus(
  "Approve Failed : " +
  err.message
);
```

}
}

// ======================
// Buy Package
// ======================

async function buyPackage(pkgId){

if(!account){

```
alert(
  "Connect wallet first"
);

return;
```

}

try{

```
setStatus(
  "Buying Package..."
);

let sponsor =
  document
  .getElementById(
    "sponsorInput"
  )
  .value
  .trim();

const sideRight =
  document
  .getElementById(
    "sideInput"
  )
  .value === "true";

if(
  !sponsor ||
  !ethers.utils.isAddress(
    sponsor
  )
){
  sponsor =
  ethers.constants
  .AddressZero;
}

const placementParent =
  ethers.constants
  .AddressZero;

const tx =
  await core.buyOrUpgrade(

    pkgId,

    sponsor,

    placementParent,

    sideRight
  );

await tx.wait();

setStatus(
  "Package Purchased Successfully"
);

await loadDashboard();
```

}catch(err){

```
console.error(err);

setStatus(
  "Buy Failed : " +
  err.message
);
```

}
}

// ======================
// Claim Vault
// ======================

async function claimVault(){

if(!account){

```
alert(
  "Connect wallet first"
);

return;
```

}

try{

```
setStatus(
  "Claiming Vault..."
);

const tx =
  await vault.claim();

await tx.wait();

setStatus(
  "Vault Claimed"
);

await loadDashboard();
```

}catch(err){

```
console.error(err);

setStatus(
  "Claim Failed : " +
  err.message
);
```

}
}
// ======================
// Countdown
// ======================

function formatCountdown(sec){

if(sec <= 0)
return "Matured";

const d =
Math.floor(
sec / 86400
);

sec =
sec % 86400;

const h =
Math.floor(
sec / 3600
);

sec =
sec % 3600;

const m =
Math.floor(
sec / 60
);

return (
d +
"d " +
h +
"h " +
m +
"m"
);
}

// ======================
// Load Staking
// ======================

async function loadStaking(){

if(!account)
return;

try{

```
const count =
  await staking
  .stakeCount(
    account
  );

const box =
  document
  .getElementById(
    "stakeList"
  );

box.innerHTML = "";

let active = 0;
let matured = 0;

let nextCountdown =
  "--";

const totalReward =
  await staking
  .pendingRewardTotal(
    account
  );

document
  .getElementById(
    "pendingRewardTotal"
  )
  .innerText =
  fmt(totalReward) +
  " NC";

for(
  let i=0;
  i<Number(count);
  i++
){

  const s =
    await staking
    .stakeAt(
      account,
      i
    );

  const reward =
    await staking
    .pendingReward(
      account,
      i
    );

  const now =
    Math.floor(
      Date.now()/1000
    );

  const remain =
    Number(s.end) - now;

  const isMatured =
    remain <= 0;

  if(!s.claimed){

    active +=
      Number(
        ethers.utils
        .formatUnits(
          s.principal,
          18
        )
      );

    if(isMatured){

      matured +=
        Number(
          ethers.utils
          .formatUnits(
            s.principal,
            18
          )
        );
    }
  }

  if(
    nextCountdown==="--" &&
    !isMatured
  ){
    nextCountdown =
      formatCountdown(
        remain
      );
  }

  const div =
    document
    .createElement(
      "div"
    );

  div.className =
    "stake-item";

  div.innerHTML =

  "<b>Stake #"+
  i+
  "</b><br><br>"+

  "Principal : "+
  fmt(
    s.principal
  )+
  " NC<br>"+

  "Reward : "+
  fmt(
    reward
  )+
  " NC<br>"+

  "Status : "+
  (
    s.claimed
    ? "Claimed"
    : (
      isMatured
      ? "Matured"
      : "Active"
    )
  )+
  "<br>"+

  "Countdown : "+
  (
    s.claimed
    ? "-"
    : formatCountdown(
        remain
      )
  )+
  "<br><br>"+

  "<button " +

  (
    s.claimed ||
    !isMatured

    ? "disabled"

    : ""
  ) +

  " onclick='claimStake("+
  i+
  ")'>" +

  "Claim Stake" +

  "</button>";

  box.appendChild(
    div
  );
}

document
  .getElementById(
    "activeStake"
  )
  .innerText =
  active.toLocaleString()
  +
  " NC";

document
  .getElementById(
    "maturedStake"
  )
  .innerText =
  matured.toLocaleString()
  +
  " NC";

document
  .getElementById(
    "nextCountdown"
  )
  .innerText =
  nextCountdown;
```

}catch(err){

```
console.error(err);
```

}
}

// ======================
// Claim Stake
// ======================

async function claimStake(id){

try{

```
setStatus(
  "Claiming Stake..."
);

const tx =
  await staking
  .claimStake(id);

await tx.wait();

setStatus(
  "Stake Claimed"
);

await loadDashboard();
```

}catch(err){

```
console.error(err);

setStatus(
  err.message
);
```

}
}

// ======================
// Claim All
// ======================

async function claimAllMatured(){

try{

```
setStatus(
  "Claim All..."
);

const tx =
  await staking
  .claimAllMatured(
    50
  );

await tx.wait();

setStatus(
  "Claim All Success"
);

await loadDashboard();
```

}catch(err){

```
console.error(err);

setStatus(
  err.message
);
```

}
}

// ======================
// Events
// ======================

if(window.ethereum){

window.ethereum.on(

```
"accountsChanged",

()=>{
  location.reload();
}
```

);

window.ethereum.on(

```
"chainChanged",

()=>{
  location.reload();
}
```

);
}

// ======================
// Auto Refresh
// ======================

setInterval(()=>{

if(account){

```
loadDashboard();
```

}

},30000);
