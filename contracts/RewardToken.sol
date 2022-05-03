// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(address marketAddress) ERC20("DGT", "DGT") {
        _mint(marketAddress, 10000000 * (10**uint256(decimals())));
    }

    function mint(address target) public {
        _mint(target, 10000000 * (10**uint256(decimals())));
    }
}
