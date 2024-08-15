import * as borsh from '../third_party/borsh-js/borsh.js';

function GetSolanaWallet()
{
    let solanaWallet = new SolanaWallet();
    solanaWallet.Init();
    return solanaWallet;
}
window.GetSolanaWallet = GetSolanaWallet;

class SolanaWallet {
    constructor()
    {
        this.network = "";  //"https://solana-mainnet.phantom.tech"
        this.publicKey = "";
        this.provider = null;
        this.connection = null;
    }

    async Init(network_url = "devnet")
    {
        this.network = network_url;
        this.connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl(network_url));

        // connect to phantom wallet
        await this.ConnectSolanaWallet();
    }

    async ConnectSolanaWallet()
    {    
        this.provider = window.phantom.solana;
    
        try {
            const resp = await this.provider.connect();
            this.publicKey = resp.publicKey.toString();
            console.log("connecting to solana wallet of public key: " + this.publicKey);
        }
        catch(err) {
            console.log("could not connect to solana wallet")
            console.log(err);
        }
    }

    async RequestAirdrop(_amount)
    {      
        let airdropSignature = await this.connection.requestAirdrop(
            this.provider.publicKey,
            _amount * solanaWeb3.LAMPORTS_PER_SOL,
        );
        let res = await this.connection.confirmTransaction({ signature: airdropSignature });
        console.log(res);
    }

    async GetBalance()
    {
        let lamports = await this.connection.getBalance(this.provider.publicKey);
        return lamports;
    }

    CreateSOLTransaction(receiving_address, _amount)
    {
        let transaction = new window.solanaWeb3.Transaction();
        transaction.add(
            window.solanaWeb3.SystemProgram.transfer({
                fromPubkey: this.provider.publicKey,
                toPubkey: receiving_address,
                lamports: window.solanaWeb3.LAMPORTS_PER_SOL * _amount
            }),        
        );
        return transaction;
    }

    async GetAccountInfo(account_id)
    {
        /// convert base58 to public key
        let t_pubkey = new window.solanaWeb3.PublicKey(account_id);
        console.log(`Account: ${t_pubkey.toBase58()}`);

        /// fetch info
        const t_info = await this.connection.getAccountInfo(t_pubkey);

        if(t_info)
        {
            // console.log(t_info);
            return t_info;
        }
        else
        {
            console.log("account does not exist")
            return {error: "account does not exist"};
        }
    }

    /// current program id: PrJQaUxSmwAuv1KYKRMtRexm9mGBi38SYph9LMDiyin
    async CreateAccount(program_id, account_size, payer_pubkey = null)
    {
        if(!this.connection) this.connection = new window.solanaWeb3.Connection(this.network)

        /// generate a key pair
        let t_accountKeypair = new solanaWeb3.Keypair();
        // console.log(t_accountKeypair);

        /// evaluate the cost of creating the account
        let t_cost = await this.connection.getMinimumBalanceForRentExemption(account_size);
        console.log("cost: " + t_cost / solanaWeb3.LAMPORTS_PER_SOL);

        /// if no payer specified, set the current wallet as the payer
        if(!payer_pubkey) payer_pubkey = this.provider.publicKey;
        // console.log(payer_pubkey);

        /// convert program id to public key
        let t_programKey = new window.solanaWeb3.PublicKey(program_id);
        // console.log(t_programKey);

        /// create the instruction for creating an account
        let t_instruction = solanaWeb3.SystemProgram.createAccount({
            fromPubkey: payer_pubkey,
            lamports: t_cost,
            newAccountPubkey: t_accountKeypair.publicKey,
            programId: t_programKey,
            space: account_size
        });

        try {
            /// create the transaction and add the instruction
            let t_transaction = new solanaWeb3.Transaction();
            t_transaction.add(t_instruction);

            /// sign the transaction (do a partial sign with the account pair first)
            var t_signedTransaction = await this.PrepareTransaction(t_transaction, t_accountKeypair);
            // console.log(t_signedTransaction);

            /// send the transaction
            let t_signature = await this.SendSignedTransaction(t_signedTransaction);
            // console.log(t_signature);

            // let res = await this.connection.getSignatureStatus(t_signature);
            // console.log(res);

            console.log(`account ${t_accountKeypair.publicKey} created`);

            return t_accountKeypair.publicKey;
        }
        catch(error)
        {
            console.log(error);
            return null;
        }
    }

    async SendTransaction(transaction)
    {
        transaction.feePayer = this.provider.publicKey;

        console.log("Getting recent blockhash");
        const resp = await this.connection.getRecentBlockhash();
        const blockhash = resp.blockhash;
        transaction.recentBlockhash = blockhash;

        // Check if blockhash was received and sign + send transaction
        if(blockhash)
        {
            let signed = await this.provider.signTransaction(transaction);
            // console.log(signed);
            let signature = await this.connection.sendRawTransaction(signed.serialize());
            console.log("Transaction sent - " + signature);
            return signature;
        }
        else
        {
            console.log("Failed to get blockhash. Transaction not sent.");
            return {error: "Failed to get blockhash. Transaction not sent."};
        }
    }

    async PrepareTransaction(transaction, secondary_signer)
    {
        transaction.feePayer = this.provider.publicKey;

        if(!this.connection) this.connection = new window.solanaWeb3.Connection(this.network)

        const resp = await this.connection.getRecentBlockhash();
        const blockhash = resp.blockhash;
        transaction.recentBlockhash = blockhash;

        // Check if blockhash was received and sign + send transaction
        if(blockhash)
        {
            if(secondary_signer) transaction.partialSign(secondary_signer);

            let signedTransaction = await this.provider.signTransaction(transaction);
            return signedTransaction;
        }
        else
        {
            console.log("Failed to get blockhash. Transaction not sent.");
            return {error: "Failed to get blockhash. Transaction not sent."};
        }
    }

    async SendSignedTransaction(signed_transaction)
    {
        if(!this.connection) this.connection = new solanaWeb3.Connection(this.network)

        try {
            let signature = await this.connection.sendRawTransaction(signed_transaction.serialize());
            // console.log("Transaction sent", signature);
            return signature;
        }
        catch(error)
        {
            if(error.getLogs)
            {
                /// for SendSignedTransaction, we need to fetch the logs
                let t_connection = this.connection;
                error.getLogs(t_connection).then(logs => {
                    console.log(logs);
                });
            }
            else console.log(error);
            return null;
        }
    }

    async SignTransaction(transaction)
    {
        let signedTransaction = await this.provider.signTransaction(transaction);
        return signedTransaction;
    }

    static async PrepareTransaction(transaction)
    {
        let provider = window.phantom.solana;
        transaction.feePayer = provider.publicKey;

        const connection = new window.solanaWeb3.Connection(this.network)

        const resp = await connection.getRecentBlockhash();
        const blockhash = resp.blockhash;
        transaction.recentBlockhash = blockhash;

        // Check if blockhash was received and sign + send transaction
        if(blockhash)
        {
            let signedTransaction = await this.provider.signTransaction(transaction);
            return signedTransaction;
        }
        else
        {
            console.log("Failed to get blockhash. Transaction not sent.");
            return {error: "Failed to get blockhash. Transaction not sent."};
        }
    }

    async SignTransaction(transaction)
    {
        let signedTransaction = await this.provider.signTransaction(transaction);
        return signedTransaction;
    }


////////////////// Examples ////////////////////////////////

    async SayHello(program_id)
    {
        /// program id (testnet): L5aEztCssLEa5nTD2SAecHRKy39e3L2P5j3PNUx8pqd
        let t_programKey = new window.solanaWeb3.PublicKey(program_id);

        let t_schema = { array: { type: 'u8' }};
        let t_encoded = borsh.serialize(t_schema, [1]);

        const instruction = new solanaWeb3.TransactionInstruction({
            keys: [],
            programId: t_programKey,
            data: t_encoded
        });

        try {
            let transaction = new solanaWeb3.Transaction();
            transaction.add(instruction);
            var signedTransaction = await this.PrepareTransaction(transaction);
            let res = await this.SendSignedTransaction(signedTransaction);
            console.log(res);
            return res;    
        }
        catch(error)
        {
            let t_connection = this.connection;
            error.getLogs(t_connection).then(logs => {
                console.log(logs);
            });
            return error;
        }
    }



    GetAccountSize()
    {
        let t_schema = { struct: {counter: 'u32'} };
        let t_value = {counter: 1};
        let t_encoded = borsh.serialize(t_schema, t_value);
        return t_encoded.length;
    }

    DecodeAccount(account_data)
    {
        let t_schema = { struct: {counter: 'u32'} };
        return borsh.deserialize(t_schema, account_data);
    }

    async GreetAccount(program_id, account_id)
    {
        /// program id: PrJQaUxSmwAuv1KYKRMtRexm9mGBi38SYph9LMDiyin
        /// account id (there are multiple others): 88AzRtS7SzZf7k1j3jdaxmLX3CjTjnyw9ozaZ418VrN6, 7AA4gaK4Gh46HHqy5Mz7UvrqDe2m8YYju7qzwgNP8rY9, ...
        if(!this.connection) this.connection = new solanaWeb3.Connection(this.network);

        let t_programPubkey = new solanaWeb3.PublicKey(program_id);
        let t_accountPubkey = new solanaWeb3.PublicKey(account_id);

        // Create greet instruction
        let t_instruction = new solanaWeb3.TransactionInstruction({
            keys: [
                {
                    pubkey: t_accountPubkey,
                    isSigner: false,
                    isWritable: true,
                },
            ],
            programId: t_programPubkey,
        });

        try {
            /// create the transaction and add the instruction
            let t_transaction = new solanaWeb3.Transaction();
            t_transaction.add(t_instruction);

            /// sign the transaction (do a partial sign with the account pair first)
            var t_signedTransaction = await this.PrepareTransaction(t_transaction);
            console.log(t_signedTransaction);

            /// send the transaction
            let res = await this.SendSignedTransaction(t_signedTransaction);
            console.log(res);

            return res;
        }
        catch(error)
        {
            console.log(error);
            return null;
        }
    }

    async GetGreetAccount(account_id)
    {
        let t_info = await this.GetAccountInfo(account_id);
        if(!t_info) console.log("no account");
        else
        {
            let t_data = this.DecodeAccount(t_info.data);
            console.log(t_data);
        }
    }




    static async PaySolana(new_amount, to_address)
    {
        const connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl("devnet")); //mainnet-beta"));

        let provider = window.phantom.solana;

        const transaction = new window.solanaWeb3.Transaction().add(
            window.solanaWeb3.SystemProgram.transfer({
                fromPubkey: provider.address,
                toPubkey: to_address,
                lamports: new_amount,
            })
        );
        transaction.feePayer = publicKey;

        let blockhashObj = await connection.getLatestBlockhash();
        transaction.recentBlockhash = await blockhashObj.blockhash;
        // Transaction constructor initialized successfully
        if (transaction) {
            console.log("Txn created successfully");
        }

        const { signature } = await provider.signAndSendTransaction(transaction);
        const { value } = await connection.getSignatureStatus(signature);
        // https://github.com/phantom/sandbox/blob/b57fdd0e65ce4f01290141a01e33d17fd2f539b9/src/utils/pollSignatureStatus.ts
        const confirmationStatus = value?.confirmationStatus;

        //Signature or the txn hash
        console.log("Signature: ", signature);
    }















    static async SendSolanaTransaction(program_id)
    {    

        const connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl("devnet"));
        let provider = window.phantom.solana;
        transaction.feePayer = this.provider.publicKey;

        let transaction = new window.solanaWeb3.Transaction().add(
            window.solanaWeb3.SystemProgram.transfer({
                fromPubkey: provider.address,
                toPubkey: t_res.address,
                lamports: new_amount,
            })
        );
        transaction.feePayer = publicKey;

        // const wallet = window.solana
        // const network = clusterApiUrl("devnet")
        // const connection = new Connection(network, opts.preflightCommitment);

        // const provider = new Provider(connection, wallet, opts.preflightCommitment)
        
        const program = new Program(idl, programID, provider);

        const localAccount = web3.Keypair.generate();

        await program.rpc.initialize(new BN(1234), {
            accounts: {
                myAccount: localAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            },
            signers: [localAccount],
        })
        
        const acc = await program.account.myAccount.fetch(localAccount.publicKey)
        console.log('acc: ', acc)
    }

    static async ReadSolanaContract() {
        try {
        const wallet = window.solana;
        const network = clusterApiUrl("devnet")
        const connection = new Connection(network);

        const provider = new Provider(
            connection, wallet, { commitment: "processed" },
        )
        
        } catch (err) {
        console.log('error: ', err)
        }
    }

    static async GrantCreditsFromSpace(space_id, credit_amount) {
        const param = {
            method: "POST",
            headers: {
                'Authorization': TokenTxt(),
                'Content-Type': "application/json",
                "spaceid": space_id,
                "creditamount": credit_amount,
            },
        };

        try {
            let res = await fetch(backend + "/space/grantcreditsfromspace", param);
            let data = await res.json();
            return data;
        }
        catch (error) {
            console.log(error);
            return null;
        };
    }
}