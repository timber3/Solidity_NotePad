const Lottery = artifacts.require("Lottery");
const AssertRevert = require('./AssertRevert');

contract('Lottery', function ([deployer, user1, user2]) {
    let lottery;
    beforeEach(async () => {
        console.log('BeforeEach');
        lottery = await Lottery.new();
    })

    it('get Pot should return current pot', async () => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0);
    })

    describe('Bet', function () {
        it.only('should fail when the bet money is not 0.005 ETH', async () => {
            // smart contract 를 만들때는 트랜잭션 오브젝트를 만들 수 있다.  5 * 10 * 15
            await AssertRevert(lottery.bet('0xab', { from: user1, value: 5 * 10 ** 15 }));
        })
        it('should put the bet queue with 1 bet', async () => {

            // bet

            // check contract balance
        })
    })

})