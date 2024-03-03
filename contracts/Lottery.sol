// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Lottery {
    struct BetInfo {
        uint256 answerBlockNumber;
        address payable bettor;
        bytes1 challenges;
    }

    uint256 private _tail;
    uint256 private _head;
    mapping(uint256 => BetInfo) private _bets;

    uint256 internal constant BLOCK_LIMIT = 256;
    uint256 internal constant BET_BLOCK_INTERVAL = 3;
    uint256 internal constant BET_AMOUNT = 5 * (10 ** 15);
    address public owner;
    uint256 private _pot;

    event BET(
        uint256 idx,
        address bettor,
        uint256 amoumt,
        bytes1 challenges,
        uint256 answerBlockNumber
    );

    constructor() {
        owner = msg.sender;
    }

    function getPot() public view returns (uint256 pot) {
        return _pot;
    }

    function getBetInfo(
        uint256 idx
    )
        public
        view
        returns (uint256 answerBlockNumber, address bettor, bytes1 challenges)
    {
        BetInfo memory b = _bets[idx];
        answerBlockNumber = b.answerBlockNumber;
        bettor = b.bettor;
        challenges = b.challenges;
    }

    function betPush(bytes1 challenges) internal returns (bool) {
        BetInfo memory b;
        b.bettor = payable(msg.sender);
        b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
        b.challenges = challenges;

        _bets[_tail] = b;
        _tail++;

        return true;
    }

    function betPop(uint256 idx) internal returns (bool) {
        // delete를 하게 되면 가스를 돌려받는다고 함
        // 필요하지 않는 값은 delete 해서 반환하는게 좋다.
        delete _bets[idx];
        return true;
    }

    // Bet Modifier
    modifier betCheck(bytes1 challenges) {
        require(msg.value == BET_AMOUNT, "Not Enough ETH");
        require(betPush(challenges), "Fail to add a new Bet info");
        _;
    }

    // Bet function

    /**
    @dev 베팅하는 함수
    @param challenges : 베팅하면서 거는 1byte의 문자
    @return result : 베팅 성공했으면 true 
     */
    function bet(
        bytes1 challenges
    ) public payable betCheck(challenges) returns (bool result) {
        emit BET(
            _tail - 1,
            msg.sender,
            msg.value,
            challenges,
            block.number + BET_BLOCK_INTERVAL
        );

        return true;
    }
}
