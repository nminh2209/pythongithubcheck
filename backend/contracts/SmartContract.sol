// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TradingPlatform {
    struct Asset {
        string symbol;
        uint256 price;
        uint256 totalVolume;
        bool isListed;
    }
    
    struct Trade {
        address trader;
        string symbol;
        uint256 price;
        uint256 volume;
        uint256 timestamp;
        bool isBuy;
    }
    
    mapping(string => Asset) public assets;
    mapping(address => mapping(string => uint256)) public portfolios;
    Trade[] public trades;
    
    event AssetListed(string symbol, uint256 price);
    event TradeExecuted(address trader, string symbol, uint256 price, uint256 volume, bool isBuy);
    
    constructor() payable {}

    function listAsset(string memory _symbol, uint256 _price) external {
        require(!assets[_symbol].isListed, "Asset already listed");
        assets[_symbol] = Asset(_symbol, _price, 0, true);
        emit AssetListed(_symbol, _price);
    }

    function executeTrade(string memory _symbol, uint256 _volume, bool _isBuy) external payable {
        require(assets[_symbol].isListed, "Asset not listed");

        uint256 tradeValue = assets[_symbol].price * _volume;
        
        if (_isBuy) {
            require(msg.value >= tradeValue, "Insufficient ETH sent");
            portfolios[msg.sender][_symbol] += _volume;
        } else {
            require(portfolios[msg.sender][_symbol] >= _volume, "Insufficient assets to sell");
            require(address(this).balance >= tradeValue, "Contract has insufficient ETH");
            
            portfolios[msg.sender][_symbol] -= _volume;
            payable(msg.sender).transfer(tradeValue);
        }
        
        trades.push(Trade(msg.sender, _symbol, assets[_symbol].price, _volume, block.timestamp, _isBuy));
        emit TradeExecuted(msg.sender, _symbol, assets[_symbol].price, _volume, _isBuy);
    }

    function getAsset(string memory _symbol) public view returns (Asset memory) {
        return assets[_symbol];
    }

    function getPortfolio(address _owner, string memory _symbol) public view returns (uint256) {
        return portfolios[_owner][_symbol];
    }

    receive() external payable {}
}
