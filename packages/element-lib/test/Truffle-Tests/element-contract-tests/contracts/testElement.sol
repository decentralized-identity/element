pragma solidity >=0.4.21 <0.7.0;

interface IElementOperatorRegistryStaking {

function registerOperator (bytes32 commitmenthash) external returns (bool);

}

contract testElement {

    function test (address elementcontract) public returns (bool) {

        bytes32 hash = keccak256('1234');

        bool success = IElementOperatorRegistryStaking(elementcontract).registerOperator(hash);

        if (success) {return true;}
        else {return false;}

    }


}