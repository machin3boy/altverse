// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IWormholeRelayer.sol";
import "./interfaces/IWormholeReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

       /*         88         8b           d8                                              
      d88b        88    ,d   `8b         d8'                                              
     d8'`8b       88    88    `8b       d8'                                               
    d8'  `8b      88  MM88MMM  `8b     d8'  ,adPPYba,  8b,dPPYba,  ,adPPYba,   ,adPPYba,  
   d8YaaaaY8b     88    88      `8b   d8'  a8P_____88  88P'   "Y8  I8[    ""  a8P_____88  
  d8""""""""8b    88    88       `8b d8'   8PP"""""""  88           `"Y8ba,   8PP"""""""  
 d8'        `8b   88    88,       `888'    "8b,   ,aa  88          aa    ]8I  "8b,   ,aa  
d8'          `8b  88    "Y888      `8'      `"Ybbd8"'  88          `"YbbdP"'   `"Ybbd8*/

contract Altverse is IWormholeReceiver, ERC20 {
    struct Pool {
        IERC20 token;
        uint256 tokenReserve;
        uint256 altReserve;
        uint256 totalShares;
    }

    struct Escrow {
        address user;
        uint256 altAmount;
        uint256 timeout;
        bool active;
    }

    struct Message {
        address fromToken;
        address toToken;
        uint256 altAmount;
        address recipient;
        bytes32 escrowId;
        bool requiresConfirmation;
    }

    mapping(address => Pool) public pools;
    mapping(address => mapping(address => uint256)) public userShares;
    mapping(bytes32 => Escrow) public escrows;
    mapping(address => uint256) public userEscrowCount;
    mapping(address => mapping(uint256 => bytes32)) public userEscrows;

    IWormholeRelayer public wormholeRelayer;
    address public owner;
    uint256 public GAS_LIMIT = 1000000;
    uint256 public ESCROW_TIMEOUT = 1 hours;

    IERC20 public designatedUSDC;
    uint256 public constant USDC_DECIMALS = 6;

    mapping(uint16 => bytes32) public registeredSenders;

    // 0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84 - celo alfajores testnet
    // 0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB - avalanche fuji testnet
    constructor(address _wormholeRelayer) ERC20("AltVerse", "ALT") {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        owner = msg.sender;
        _mint(address(this), 1_000_000_000_000 * 10**decimals());
        _transfer(address(this), msg.sender, 1_000_000_000 * 10**decimals());
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier isRegisteredSender(uint16 sourceChain, bytes32 sourceAddress) {
        require(
            registeredSenders[sourceChain] == sourceAddress,
            "Not registered sender"
        );
        _;
    }

    function faucet() public {
        _transfer(address(this), msg.sender, 10_000 * 10**decimals());
    }

    function addLiquidity(
        address _token,
        uint256 _tokenAmount,
        uint256 _altAmount
    ) public {
        require(_token != address(this), "Cannot add liquidity to ALT");

        Pool storage pool = pools[_token];

        if (address(pool.token) == address(0)) {
            pools[_token] = Pool({
                token: IERC20(_token),
                tokenReserve: 0,
                altReserve: 0,
                totalShares: 0
            });
            pool = pools[_token];
        }

        uint256 shares = pool.totalShares == 0
            ? _tokenAmount
            : (_tokenAmount * pool.totalShares) / pool.tokenReserve;

        pool.token.approve(address(this), type(uint256).max);

        pool.token.transferFrom(msg.sender, address(this), _tokenAmount);
        _transfer(msg.sender, address(this), _altAmount);

        pool.tokenReserve += _tokenAmount;
        pool.altReserve += _altAmount;
        pool.totalShares += shares;
        userShares[_token][msg.sender] += shares;
    }

    function removeLiquidity(address _token, uint256 _shares) public {
        require(_token != address(this), "Cannot remove liquidity from ALT");
        Pool storage pool = pools[_token];
        require(address(pool.token) != address(0), "Pool does not exist");
        require(
            userShares[_token][msg.sender] >= _shares,
            "Insufficient shares"
        );

        uint256 tokenAmount = (_shares * pool.tokenReserve) / pool.totalShares;
        uint256 altAmount = (_shares * pool.altReserve) / pool.totalShares;

        userShares[_token][msg.sender] -= _shares;
        pool.totalShares -= _shares;
        pool.tokenReserve -= tokenAmount;
        pool.altReserve -= altAmount;

        pool.token.transfer(msg.sender, tokenAmount);
        _transfer(address(this), msg.sender, altAmount);
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        require(
            amountIn > 0 && reserveIn > 0 && reserveOut > 0,
            "Invalid amounts"
        );
        uint256 amountInWithFee = amountIn * 9985; // 0.15% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10000) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getPrice(address _token) public view returns (uint256) {
        Pool storage pool = pools[_token];
        require(address(pool.token) != address(0), "Pool does not exist");
        return (pool.altReserve * 1e18) / pool.tokenReserve;
    }

    function _internalSwapIn(
        address _fromToken,
        uint256 _amountIn,
        address _sender
    ) internal returns (uint256 altAmount) {
        require(_fromToken != address(this), "Cannot swap from ALT");
        Pool storage pool = pools[_fromToken];
        require(address(pool.token) != address(0), "Pool does not exist");

        altAmount = getAmountOut(_amountIn, pool.tokenReserve, pool.altReserve);

        pool.token.transferFrom(_sender, address(this), _amountIn);
        pool.tokenReserve += _amountIn;
        pool.altReserve -= altAmount;

        return altAmount;
    }

    function _internalSwapOut(
        address _toToken,
        uint256 _altAmount,
        address _recipient
    ) internal returns (uint256 tokenAmount) {
        require(_toToken != address(this), "Cannot swap to ALT");
        Pool storage pool = pools[_toToken];
        require(address(pool.token) != address(0), "Pool does not exist");

        tokenAmount = getAmountOut(
            _altAmount,
            pool.altReserve,
            pool.tokenReserve
        );
        pool.token.transferFrom(address(this), _recipient, tokenAmount);
        pool.altReserve += _altAmount;
        pool.tokenReserve -= tokenAmount;

        return tokenAmount;
    }

    function quoteCrossChainCost(uint16 targetChain)
        public
        view
        returns (uint256 cost)
    {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }

    function initiateCrossChainSwap(
        address _fromToken,
        address _toToken,
        uint256 _amountIn,
        uint16 targetChain,
        address targetAddress
    ) public {
        uint256 altAmount;

        if (_fromToken != address(this)) {
            altAmount = _internalSwapIn(_fromToken, _amountIn, msg.sender);
        } else {
            _transfer(msg.sender, address(this), _amountIn);
            altAmount = _amountIn;
        }

        uint256 cost = quoteCrossChainCost(targetChain);
        require(
            address(this).balance >= cost,
            "Insufficient contract balance for cross-chain delivery"
        );

        bytes32 escrowId = keccak256(
            abi.encodePacked(msg.sender, altAmount, block.timestamp)
        );
        escrows[escrowId] = Escrow({
            user: msg.sender,
            altAmount: altAmount,
            timeout: block.timestamp + ESCROW_TIMEOUT,
            active: true
        });

        uint256 escrowIndex = userEscrowCount[msg.sender];
        userEscrows[msg.sender][escrowIndex] = escrowId;
        userEscrowCount[msg.sender]++;

        Message memory message = Message({
            fromToken: _fromToken,
            toToken: _toToken,
            altAmount: altAmount,
            recipient: msg.sender,
            escrowId: escrowId,
            requiresConfirmation: true
        });

        bytes memory payload = abi.encode(message);
        _sendCrossChainMessage(targetChain, targetAddress, payload, cost);
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable override isRegisteredSender(sourceChain, sourceAddress) {
        require(
            msg.sender == address(wormholeRelayer),
            "Only Wormhole relayer allowed"
        );

        Message memory receivedMessage = abi.decode(payload, (Message));

        if (receivedMessage.requiresConfirmation) {
            if (receivedMessage.toToken != address(this)) {
                // Swap ALT for the desired ERC token and send to the recipient
                _internalSwapOut(
                    receivedMessage.toToken,
                    receivedMessage.altAmount,
                    receivedMessage.recipient
                );
            } else {
                // Directly transfer ALT to the recipient
                _transfer(
                    address(this),
                    receivedMessage.recipient,
                    receivedMessage.altAmount
                );
            }

            Message memory confirmationMessage = Message({
                fromToken: address(0),
                toToken: address(0),
                altAmount: 0,
                recipient: address(0),
                escrowId: receivedMessage.escrowId,
                requiresConfirmation: false
            });

            bytes memory confirmationPayload = abi.encode(confirmationMessage);

            uint256 cost = quoteCrossChainCost(sourceChain);
            require(
                address(this).balance >= cost,
                "Insufficient balance for return transfer"
            );

            _sendCrossChainMessage(
                sourceChain,
                address(uint160(uint256(sourceAddress))),
                confirmationPayload,
                cost
            );
        } else {
            // Process the escrow on the source chain upon receiving confirmation
            processEscrow(receivedMessage.escrowId);
        }
    }

    function _sendCrossChainMessage(
        uint16 targetChain,
        address targetAddress,
        bytes memory payload,
        uint256 cost
    ) internal {
        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            targetAddress,
            payload,
            0,
            GAS_LIMIT
        );
    }

    function processEscrow(bytes32 escrowId) internal {
        require(
            msg.sender == address(this) ||
                msg.sender == address(wormholeRelayer),
            "Unauthorized"
        );
        Escrow storage escrow = escrows[escrowId];
        require(escrow.active, "Escrow is not active");

        // Burn the ALT tokens, completing the cross-chain swap
        _burn(address(this), escrow.altAmount);
        escrow.active = false;
    }

    function claimTimedOutEscrow(bytes32 escrowId) public {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.active, "Escrow is not active");
        require(block.timestamp > escrow.timeout, "Escrow not timed out");
        require(msg.sender == escrow.user, "Not escrow owner");

        _transfer(address(this), escrow.user, escrow.altAmount);
        escrow.active = false;
    }

    function getAllUserEscrows(address user)
        public
        view
        returns (Escrow[] memory)
    {
        uint256 count = userEscrowCount[user];
        Escrow[] memory userEscrowList = new Escrow[](count);
        for (uint256 i = 0; i < count; i++) {
            bytes32 escrowId = userEscrows[user][i];
            userEscrowList[i] = escrows[escrowId];
        }
        return userEscrowList;
    }

    // 14 - celo alfajores testnet chain ID
    // 6 - avalanche fuji testnet chain ID
    function setRegisteredSender(uint16 sourceChain, address sourceAddress)
        public
        onlyOwner
    {
        bytes32 convertedAddress = bytes32(uint256(uint160(sourceAddress)));
        registeredSenders[sourceChain] = convertedAddress;
    }

    function updateGasLimit(uint256 newGasLimit) public onlyOwner {
        GAS_LIMIT = newGasLimit;
    }

    function updateEscrowTimeout(uint256 newTimeout) public onlyOwner {
        ESCROW_TIMEOUT = newTimeout;
    }

    // 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B - celo alfajores testnet
    // 0x5425890298aed601595a70ab815c96711a31bc65 - avalanche fuji testnet
    function setDesignatedUSDC(address _usdcAddress) public onlyOwner {
        designatedUSDC = IERC20(_usdcAddress);
    }

    function swapUSDCForALT(uint256 usdcAmount) public {
        require(address(designatedUSDC) != address(0), "USDC not set");
        require(usdcAmount > 0, "Amount must be greater than 0");

        uint256 altAmount = (usdcAmount * 10**(decimals() - USDC_DECIMALS));

        require(
            balanceOf(address(this)) >= altAmount,
            "Insufficient ALT liquidity"
        );

        designatedUSDC.transferFrom(msg.sender, address(this), usdcAmount);
        _transfer(address(this), msg.sender, altAmount);
    }

    function swapALTForUSDC(uint256 altAmount) public {
        require(address(designatedUSDC) != address(0), "USDC not set");
        require(altAmount > 0, "Amount must be greater than 0");

        uint256 usdcAmount = altAmount / 10**(decimals() - USDC_DECIMALS);

        require(
            designatedUSDC.balanceOf(address(this)) >= usdcAmount,
            "Insufficient USDC liquidity"
        );

        _transfer(msg.sender, address(this), altAmount);
        designatedUSDC.transfer(msg.sender, usdcAmount);
    }

    function getUSDCBalance() public view returns (uint256) {
        require(address(designatedUSDC) != address(0), "USDC not set");
        return designatedUSDC.balanceOf(address(this));
    }
}
