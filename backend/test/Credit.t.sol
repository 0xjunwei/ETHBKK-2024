// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/USDC.sol";
import "../src/Credit.sol";

contract CreditTest is Test {
    USDC public usdc;
    Credit public credit;

    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public dapp1 = address(0x3);

    function setUp() public {
        // Deploy USDC mock contract
        usdc = new USDC();

        // Simulate the admin deploying the Credit contract
        vm.prank(admin);
        credit = new Credit(address(usdc));

        // Mint USDC tokens to the Credit contract for lending
        vm.prank(admin);
        usdc.transfer(address(credit), 10000000 * 10 ** usdc.decimals());

        // Mint USDC tokens to the test user to ensure they can interact with USDC
        vm.prank(admin);
        usdc.transfer(user1, 1000 * 10 ** usdc.decimals());
    }

    function testCreateAccount() public {
        // Set up a KYC hash and user address
        address testUser = user1;
        string memory kycHash = "kyc-hash-user1";

        // Call createAccount from the admin's perspective
        vm.prank(admin);
        credit.createAccount(testUser, kycHash);

        // Destructure the returned tuple
        (
            string memory retrievedKyc,
            uint256 creditLimit,
            uint256 totalBorrowed,
            uint256 totalPaid,
            uint256 totalDue,
            uint256 statementDate,
            uint256 dueDate,
            uint256 lateFee,
            bool isAccountActive
        ) = credit.accounts(testUser);

        // Assertions to verify account state
        assertEq(retrievedKyc, kycHash);
        assertEq(creditLimit, 200 * 10 ** usdc.decimals());
        assertEq(totalBorrowed, 0);
        assertEq(totalPaid, 0);
        assertEq(totalDue, 0);
        assertEq(dueDate, 0); // Due date is unset upon creation
        assertTrue(isAccountActive);
    }

    function testBorrow() public {
        // Set up a KYC hash, user, and borrowing DApp
        address testUser = user1;
        address testDapp = dapp1;
        string memory kycHash = "kyc-hash-user1";

        // Create an account for the testUser
        vm.prank(admin);
        credit.createAccount(testUser, kycHash);

        // Authorize the testDapp for borrowing
        vm.prank(testUser);
        credit.addAuthorizedDapp(testDapp);

        // Borrow funds via the authorized DApp
        uint256 borrowAmount = 100 * 10 ** usdc.decimals(); // 100 USDC
        vm.prank(testDapp);
        credit.borrowFunds(testUser, borrowAmount);

        // Destructure account state
        (
            string memory retrievedKyc,
            uint256 creditLimit,
            uint256 totalBorrowed,
            uint256 totalPaid,
            uint256 totalDue,
            uint256 statementDate,
            uint256 dueDate,
            uint256 lateFee,
            bool isAccountActive
        ) = credit.accounts(testUser);

        // Assertions
        assertEq(retrievedKyc, kycHash);
        assertEq(creditLimit, 200 * 10 ** usdc.decimals());
        assertEq(totalBorrowed, borrowAmount);
        assertEq(totalPaid, 0);
        assertEq(totalDue, borrowAmount);
        assertTrue(dueDate > block.timestamp); // Due date should be set
        assertTrue(isAccountActive);
    }

    function testUserBorrowForSelf() public {
        // Set up a KYC hash and user
        address testUser = user1;
        string memory kycHash = "kyc-hash-user1";

        // Create an account for the testUser
        vm.prank(admin);
        credit.createAccount(testUser, kycHash);

        // User borrows 50 USDC for themselves
        uint256 borrowAmount = 50 * 10 ** usdc.decimals();
        vm.prank(testUser);
        credit.borrowFunds(testUser, borrowAmount);

        // Destructure account state
        (
            string memory retrievedKyc,
            uint256 creditLimit,
            uint256 totalBorrowed,
            uint256 totalPaid,
            uint256 totalDue,
            uint256 statementDate,
            uint256 dueDate,
            uint256 lateFee,
            bool isAccountActive
        ) = credit.accounts(testUser);

        // Assertions
        assertEq(retrievedKyc, kycHash);
        assertEq(creditLimit, 200 * 10 ** usdc.decimals());
        assertEq(totalBorrowed, borrowAmount);
        assertEq(totalPaid, 0);
        assertEq(totalDue, borrowAmount);
        assertTrue(dueDate > block.timestamp); // Due date should be set
        assertTrue(isAccountActive);
    }

    function testRepayLoan() public {
        // Set up a KYC hash and user
        address testUser = user1;
        string memory kycHash = "kyc-hash-user1";

        // Create an account for the testUser
        vm.prank(admin);
        credit.createAccount(testUser, kycHash);

        // User borrows 100 USDC
        uint256 borrowAmount = 100 * 10 ** usdc.decimals();
        vm.prank(testUser);
        credit.borrowFunds(testUser, borrowAmount);

        // Verify initial state after borrowing
        (
            string memory retrievedKyc,
            uint256 creditLimit,
            uint256 totalBorrowed,
            uint256 totalPaid,
            uint256 totalDue,
            uint256 statementDate,
            uint256 dueDate,
            uint256 lateFee,
            bool isAccountActive
        ) = credit.accounts(testUser);

        assertEq(totalBorrowed, borrowAmount);
        assertEq(totalDue, borrowAmount);

        // User repays 50 USDC
        uint256 partialRepayment = 50 * 10 ** usdc.decimals();
        vm.prank(testUser);
        usdc.approve(address(credit), partialRepayment); // Approve the contract to transfer USDC
        vm.prank(testUser);
        credit.repayLoans(partialRepayment);

        // Verify state after partial repayment
        (, , totalBorrowed, totalPaid, totalDue, , , , ) = credit.accounts(
            testUser
        );
        assertEq(totalBorrowed, borrowAmount); // Borrowed amount remains the same
        assertEq(totalPaid, partialRepayment);
        assertEq(totalDue, borrowAmount - partialRepayment);

        // User repays the remaining loan
        uint256 fullRepayment = totalDue; // Remaining amount
        vm.prank(testUser);
        usdc.approve(address(credit), fullRepayment); // Approve the contract to transfer USDC
        vm.prank(testUser);
        credit.repayLoans(fullRepayment);

        // Verify state after full repayment
        (, creditLimit, totalBorrowed, totalPaid, totalDue, , , , ) = credit
            .accounts(testUser);
        assertEq(totalBorrowed, 0);
        assertEq(totalPaid, 0); // Total paid equals total borrowed
        assertEq(totalDue, 0); // Loan fully repaid
        console.log("Credit limit:", creditLimit);
    }
}
