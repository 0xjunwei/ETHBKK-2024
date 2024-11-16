//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Credit {
    // Admin list
    mapping(address => bool) public adminList;
    // Dapp > Wallet > status
    // Prevent anyone from accessing
    mapping(address => mapping(address => bool)) public activeContract;
    // Late fee percentage
    uint256 constant LATE_FEE_PERCENTAGE = 100; // 1% late fee
    uint256 constant CREDIT_INCREASE_PERCENTAGE = 100; // 1%

    struct PersonalCredit {
        // Prevent Sybil, using worldcoin kyc hashnullfier as poc, can look for more ways like 3rd party svc without scanning iris
        string kyc;
        // Sets a initial limit of 200 usdc per pax, in theory if run with funds, we can see it as marketing referral expenses
        uint256 creditLimit;
        uint256 totalBorrowed;
        uint256 totalPaid;
        // Calculating total borrowed amount  - total paid to get total due
        uint256 totalDue;
        uint256 statementDate;
        // Unix timestamp format, upon statement date we would take totalDue and charge it to due date
        uint256 dueDate;
        uint256 lateFee;
        // If in debt and not paid treat as inactivate calculating interest based on dueDate till time of payment at 2% per month? just theory
        bool isAccountActive;
    }

    // Mapping address to their personal credit
    mapping(address => PersonalCredit) public accounts;
    // Checking if null Hash been used to prevent sybil
    mapping(string => bool) public hashList;
    // Address of USDC POC will only use USDC as an example
    IERC20 immutable USDCTokenAddress;

    constructor(address _usdcTokenAddress) {
        adminList[msg.sender] = true;
        USDCTokenAddress = IERC20(_usdcTokenAddress);
    }

    // Modifier to allow only the admin to perform certain actions
    modifier onlyAdmin() {
        require(adminList[msg.sender], "Only admin can perform this action");
        _;
    }

    // Initialize a new credit account with a limit and activate it
    function createAccount(
        address _user,
        string memory _kycHash
    ) public onlyAdmin {
        PersonalCredit storage account = accounts[_user];
        require(!account.isAccountActive, "Account already active");
        account.kyc = _kycHash;
        // Assuming usdc and 6 decimals
        account.creditLimit = 200000000;
        account.totalBorrowed = 0;
        account.totalPaid = 0;
        account.totalDue = 0;
        account.statementDate = block.timestamp;
        account.dueDate = 0; // Set upon first charge
        account.lateFee = 0;
        account.isAccountActive = true;
    }

    // Add authorized hook to borrow funds
    function addAuthorizedDapp(address _addressOfDapp) public {
        PersonalCredit storage userCreditStatus = accounts[msg.sender];
        // Check if he is a kyc-ed individual first
        require(bytes(userCreditStatus.kyc).length != 0, "User is not KYC-ed");
        // Dapp > Wallet > status
        activeContract[_addressOfDapp][msg.sender] = true;
    }

    // Remove authorized hook to borrow funds
    function removeAuthorizedDapp(address _addressOfDapp) public {
        PersonalCredit storage userCreditStatus = accounts[msg.sender];
        // Check if he is a kyc-ed individual first
        require(bytes(userCreditStatus.kyc).length != 0, "User is not KYC-ed");
        // Dapp > Wallet > status
        activeContract[_addressOfDapp][msg.sender] = false;
    }

    // Create charge by authorized dapp (in this context hook contract will call for funds to allow swapping)
    function borrowFunds(
        address _borrowerAddress,
        uint256 _amountToBorrow
    ) public {
        if (msg.sender == _borrowerAddress) {
            PersonalCredit storage userCreditStatus = accounts[
                _borrowerAddress
            ];
            // Valid transfer, check the amount to borrow is within the credit limit
            require(
                userCreditStatus.totalBorrowed + _amountToBorrow <=
                    userCreditStatus.creditLimit,
                "Insufficient credit limit"
            );
            // Set due date to 30 days from now if this is the first borrow
            if (userCreditStatus.dueDate == 0) {
                userCreditStatus.dueDate = block.timestamp + 30 days;
            }
            // Check if due date if not 0
            else {
                require(
                    block.timestamp < userCreditStatus.dueDate,
                    "Cannot borrow, payment is due"
                );
            }

            // Updating user owe and debt
            // Update borrowed and due amounts
            userCreditStatus.totalBorrowed += _amountToBorrow;
            userCreditStatus.totalDue =
                userCreditStatus.totalBorrowed -
                userCreditStatus.totalPaid;
            // Transfer USDC to the borrower
            require(
                USDCTokenAddress.transfer(_borrowerAddress, _amountToBorrow),
                "USDC transfer failed"
            );
        } else {
            // Check if borrower authorized the dapp (Hook) to borrow funds for it
            require(
                activeContract[msg.sender][_borrowerAddress],
                "Only admin can perform this action"
            );
            PersonalCredit storage userCreditStatus = accounts[
                _borrowerAddress
            ];
            // Valid transfer, check the amount to borrow is within the credit limit
            require(
                userCreditStatus.totalBorrowed + _amountToBorrow <=
                    userCreditStatus.creditLimit,
                "Insufficient credit limit"
            );
            // Set due date to 30 days from now if this is the first borrow
            if (userCreditStatus.dueDate == 0) {
                userCreditStatus.dueDate = block.timestamp + 30 days;
            }
            // Check if due date if not 0
            else {
                require(
                    block.timestamp < userCreditStatus.dueDate,
                    "Cannot borrow, payment is due"
                );
            }

            // Updating user owe and debt
            // Update borrowed and due amounts
            userCreditStatus.totalBorrowed += _amountToBorrow;
            userCreditStatus.totalDue =
                userCreditStatus.totalBorrowed -
                userCreditStatus.totalPaid;
            // Transfer USDC to the borrower
            require(
                USDCTokenAddress.transfer(_borrowerAddress, _amountToBorrow),
                "USDC transfer failed"
            );
        }
    }

    // Pay back loans
    function repayLoans(uint256 _amountToRepay) public {
        PersonalCredit storage userCreditStatus = accounts[msg.sender];

        // Check if he is a kyc-ed individual first
        require(bytes(userCreditStatus.kyc).length != 0, "User is not KYC-ed");
        // Check if he has loan dued and repayment must be less than or equal to loan dued
        require(userCreditStatus.totalDue > 0, "No outstanding loan due");
        // Calculate late fee if payment is late and not already charged
        if (
            block.timestamp > userCreditStatus.dueDate &&
            userCreditStatus.lateFee == 0
        ) {
            userCreditStatus.lateFee =
                (userCreditStatus.totalDue * LATE_FEE_PERCENTAGE) /
                10000;
            // Update the total Due
            userCreditStatus.totalDue += userCreditStatus.lateFee;
        }
        require(
            _amountToRepay <= userCreditStatus.totalDue,
            "Repayment exceeds outstanding loan"
        );

        // Calls for transferfrom usdc back to contract for amount to repay
        require(
            USDCTokenAddress.transferFrom(
                msg.sender,
                address(this),
                _amountToRepay
            ),
            "USDC transfer failed"
        );

        // If amount to repay is less than amount dued, update accordingly
        if (_amountToRepay < userCreditStatus.totalDue) {
            userCreditStatus.totalPaid += _amountToRepay;
            userCreditStatus.totalDue -= _amountToRepay;
        }
        // If amount to repay is equal to amount dued, update all to 0 including due date
        else {
            userCreditStatus.totalPaid = 0;
            userCreditStatus.totalDue = 0;
            userCreditStatus.totalBorrowed = 0;
            userCreditStatus.dueDate = 0; // Reset due date
            userCreditStatus.lateFee = 0; // Reset late fee
            // Reward good behaviour, increase credit after full payment
            uint256 creditIncrease = (userCreditStatus.creditLimit *
                CREDIT_INCREASE_PERCENTAGE) / 10000;
            userCreditStatus.creditLimit += creditIncrease;
        }
    }
}
