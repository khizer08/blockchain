// Global Variables
let web3;
let votingContract;
let accounts = [];
const contractAddress = "0x117F2ca105A9872fD9d756e8a6E2f620F853C725"; // Your contract address

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await initWeb3();
  await initContract();
  setupEventListeners();
  await updateResults(); // Initial load
});

// 1. Initialize Web3 with MetaMask
async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected accounts:", accounts);

      // Update UI
      if (document.getElementById('walletStatus')) {
        document.getElementById('walletStatus').className = 'wallet-status connected';
        document.getElementById('walletStatus').textContent = `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
        document.getElementById('voteForm').style.display = 'block';
      }

      // Handle account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        accounts = newAccounts;
        location.reload(); // Refresh on account change
      });

      return true;
    } catch (error) {
      console.error("User denied access:", error);
      return false;
    }
  } else {
    console.log("MetaMask not detected");
    return false;
  }
}

// 2. Initialize Smart Contract (load ABI first)
async function initContract() {
  try {
    const response = await fetch('./VotingABI.json');
    const data = await response.json();
    const abi = data.abi;

    votingContract = new web3.eth.Contract(abi, contractAddress);
    console.log("Contract initialized");
  } catch (error) {
    console.error("Contract init error:", error);
  }
}

// 3. Event Listeners
function setupEventListeners() {
  // Connect Wallet Button
  if (document.getElementById('connectWallet')) {
    document.getElementById('connectWallet').addEventListener('click', initWeb3);
  }

  // Vote Form Submission
  if (document.getElementById('voteForm')) {
    document.getElementById('voteForm').addEventListener('submit', handleVote);
  }

  // Refresh Results Button
  if (document.getElementById('refreshResults')) {
    document.getElementById('refreshResults').addEventListener('click', updateResults);
  }

  // Auto-refresh every 10 seconds
  setInterval(updateResults, 10000);
}

// 4. Handle Voting
async function handleVote(e) {
  e.preventDefault();
  const selectedCandidate = document.querySelector('input[name="candidate"]:checked')?.value;

  if (!selectedCandidate) {
    document.getElementById('voteMessage').textContent = 'Please select a candidate!';
    return;
  }

  try {
    const candidateId = ['CONGRESS', 'BJP', 'JDS'].indexOf(selectedCandidate) + 1;
    document.getElementById('voteMessage').textContent = 'Submitting vote...';

    await votingContract.methods.vote(candidateId).send({ from: accounts[0] });
    document.getElementById('voteMessage').textContent = 'Vote submitted successfully!';

    // Update results
    await updateResults();
  } catch (error) {
    console.error("Voting error:", error);
    // document.getElementById('voteMessage').textContent = `Error: ${error.message}`;
  }
}

// 5. Update Results (Works for both vote.html and result.html)
async function updateResults() {
  try {
    const [names, counts] = await votingContract.methods.getResults().call();
    const resultsList = document.getElementById('resultsList');

    if (resultsList) {
      resultsList.innerHTML = names.map((name, i) =>
        `<li>${name}: <span class="vote-count">${counts[i]}</span> votes</li>`
      ).join('');

      // Update timestamp
      if (document.getElementById('lastUpdated')) {
        document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      }
    }
  } catch (error) {
    console.error("Results update error:", error);
  }
}
