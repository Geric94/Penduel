// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.16;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFv2Consumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface immutable coordinator;
    LinkTokenInterface immutable linkToken;

    // Your subscription ID.
    uint64 immutable subscriptionId;

    // Rinkeby coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    //address vrfCoordinator;

    // Rinkeby LINK token contract. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    //address link;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 immutable keyHash;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 800,000 gas,
    // so 900,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 constant CALLBACKGASLIMIT = 9 * (10**5);

    // The default is 3, but you can set this higher.
    uint16 constant REQUESTCONFIRMATIONS = 3;

    // For this example, retrieve 32 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 constant NUMWORDS = 32;

    uint256[] public randomValues;
    uint256 public requestId;
    address public immutable owner;

    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        //link = _link;
        keyHash = _keyHash;
        coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        linkToken = LinkTokenInterface(_link);
        owner = msg.sender;
        subscriptionId = _subscriptionId;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() external {
        // Will revert if subscription is not set and funded.
        requestId = coordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUESTCONFIRMATIONS,
            CALLBACKGASLIMIT,
            NUMWORDS
        );
    }

    function fulfillRandomWords( uint256, /* requestId */ uint256[] memory randomValues_) internal override {
        randomValues = randomValues_;
    }

    function getRandomValue( uint256 index) external view returns ( uint256) {
        require( index < 32, 'The index must be less than 32' );
        uint256 value = randomValues[index];
        return value;
    }
}