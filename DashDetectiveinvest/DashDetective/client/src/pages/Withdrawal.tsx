import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Withdrawal() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount || !address) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    console.log('Withdrawal:', wallet, amount, address);
    toast({
      title: "Withdrawal Requested",
      description: `Withdrawing $${amount} to ${wallet}`,
    });
    setAmount('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Withdrawal</h1>
        <p className="text-muted-foreground">Request a withdrawal from your account</p>
      </div>

      <Card className="p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6">Make Withdrawal</h2>
        <form onSubmit={handleWithdrawal} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wallet-withdrawal">Withdrawal Method</Label>
            <Select value={wallet} onValueChange={setWallet}>
              <SelectTrigger id="wallet-withdrawal" data-testid="select-withdrawal-wallet">
                <SelectValue placeholder="Select a Wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bitcoin">Bitcoin</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                <SelectItem value="usdt-erc20">USDT (ERC20)</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-withdrawal">Amount ($)</Label>
            <Input
              id="amount-withdrawal"
              type="number"
              step="0.01"
              placeholder="Enter Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-withdrawal-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Wallet Address / Bank Account</Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter your wallet address or bank account"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="input-withdrawal-address"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Please note: Withdrawals may take 1-3 business days to process. A processing fee may apply.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            data-testid="button-withdrawal"
          >
            Request Withdrawal
          </Button>
        </form>
      </Card>
    </div>
  );
}
