const Lottery = artifacts.require("Lottery");
const AssertRevert = require('./AssertRevert');
const ExpectEvent = require('./ExpectEvent');

contract('Lottery', function ([deployer, user1, user2]) {
    let lottery;
    beforeEach(async () => {
        console.log('==========================================================');
        lottery = await Lottery.new();
    })

    it('get Pot should return current pot', async () => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0);
    })

    describe('Bet', function () {
        it('should fail when the bet money is not 0.005 ETH', async () => {
            // smart contract 를 만들때는 트랜잭션 오브젝트를 만들 수 있다.  5 * 10 * 15
            await AssertRevert(lottery.bet('0xab', { from: user1, value: 5 * 10 ** 15 }));
        })
        it.only('should put the bet queue with 1 bet', async () => {

            // bet
            let receipt = await lottery.bet('0xab', { from: user1, value: 5 * (10 ** 15) });
            console.log(receipt);

            // check pot
            let pot = await lottery.getPot();
            assert.equal(pot, 0);

            // check contract balance ( 잔고 )
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, (5 * 10 ** 15));

            // check betInfo
            let currentBlockNumber = await web3.eth.getBlockNumber();
            let bet = await lottery.getBetInfo(0);

            assert(bet.answerBlockNumber, currentBlockNumber + 3);
            assert(bet.bettor, user1);
            assert(bet.challenges, '0xab');

            // check Logs
            await ExpectEvent.inLogs(receipt.logs, 'BET');
        })

    })

})