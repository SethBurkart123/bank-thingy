"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock } from "lucide-react";
import { AnimatedBalance } from "@/components/animated-balance";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  sender: {
    email: string;
  };
  recipient: {
    email: string;
  };
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function fetchData() {
    try {
      const [userResponse, transactionsResponse] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/transactions"),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setBalance(userData.balance);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data",
      });
    }
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const recipientEmail = formData.get("email") as string;
    const amount = parseFloat(formData.get("amount") as string);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          amount,
        }),
      });

      if (!response.ok) {
        const data = await response.text();
        throw new Error(data || "Failed to send money");
      }

      toast({
        title: "Success",
        description: "Money sent successfully",
      });

      await fetchData();

      (event.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send money",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className="flex-1 space-y-6 p-8 pt-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h2>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium opacity-80">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedBalance value={balance} className="text-4xl font-bold" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-violet-500" />
                <span>Send Money</span>
              </CardTitle>
              <CardDescription>Send money to another account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    disabled={isLoading}
                    className="border-violet-100 focus:border-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                    className="border-violet-100 focus:border-violet-500"
                  />
                </div>
                <Button
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  {isLoading ? "Sending..." : "Send Money"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-violet-500" />
                <span>Recent Transactions</span>
              </CardTitle>
              <CardDescription>
                Your recent transaction history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    className="flex items-center p-3 rounded-lg hover:bg-violet-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="h-9 w-9 rounded-full flex items-center justify-center bg-violet-100">
                      {transaction.type === "SEND" ? (
                        <ArrowUpRight className="h-5 w-5 text-violet-500" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="ml-4 flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {transaction.type === "SEND"
                          ? `Sent to ${transaction.recipient.email}`
                          : `Received from ${transaction.sender.email}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.type === "SEND"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {transaction.type === "SEND" ? "-" : "+"}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No transactions yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
