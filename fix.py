import pathlib
content = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/contracts/LedgerValidator.sol').read_text(encoding='utf-8')
content = content.replace('address public immutable ledgerAuthority;', 'address public ledgerAuthority;')

transfer_fn = '''
    function transferAuthority(address _newAuthority) external onlyAuthority {
        require(_newAuthority != address(0), "Invalid address");
        emit AuthorityTransferred(ledgerAuthority, _newAuthority);
        ledgerAuthority = _newAuthority;
    }
'''

content = content.replace('function pingReserve(', transfer_fn + '\n    function pingReserve(')
pathlib.Path('d:/Projects/Wallet Human Polymarket ID/contracts/LedgerValidator.sol').write_text(content, encoding='utf-8')
print('Fixed LedgerValidator.sol')
