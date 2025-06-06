import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Lock, Unlock, Eye, EyeOff } from "lucide-react";

export default function CryptographyLab() {
  const [vigenereKey, setVigenereKey] = useState("APPLE");
  const [vigenereText, setVigenereText] = useState("SECRET MESSAGE");
  const [vigenereResult, setVigenereResult] = useState("");
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarText, setCaesarText] = useState("HELLO WORLD");
  const [caesarResult, setCaesarResult] = useState("");
  const [showVigenereTable, setShowVigenereTable] = useState(false);

  // Vigenère cipher implementation
  const vigenereEncrypt = (text: string, key: string): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    text = text.toUpperCase().replace(/[^A-Z]/g, "");
    key = key.toUpperCase().replace(/[^A-Z]/g, "");
    let result = "";
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text[i];
      const keyChar = key[i % key.length];
      const textIndex = alphabet.indexOf(textChar);
      const keyIndex = alphabet.indexOf(keyChar);
      const encryptedIndex = (textIndex + keyIndex) % 26;
      result += alphabet[encryptedIndex];
    }
    
    return result;
  };

  const vigenereDecrypt = (text: string, key: string): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    text = text.toUpperCase().replace(/[^A-Z]/g, "");
    key = key.toUpperCase().replace(/[^A-Z]/g, "");
    let result = "";
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text[i];
      const keyChar = key[i % key.length];
      const textIndex = alphabet.indexOf(textChar);
      const keyIndex = alphabet.indexOf(keyChar);
      const decryptedIndex = (textIndex - keyIndex + 26) % 26;
      result += alphabet[decryptedIndex];
    }
    
    return result;
  };

  // Caesar cipher implementation
  const caesarEncrypt = (text: string, shift: number): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    text = text.toUpperCase().replace(/[^A-Z]/g, "");
    let result = "";
    
    for (let char of text) {
      const index = alphabet.indexOf(char);
      const newIndex = (index + shift) % 26;
      result += alphabet[newIndex];
    }
    
    return result;
  };

  const caesarDecrypt = (text: string, shift: number): string => {
    return caesarEncrypt(text, -shift);
  };

  const performVigenereOperation = (operation: "encrypt" | "decrypt") => {
    if (operation === "encrypt") {
      setVigenereResult(vigenereEncrypt(vigenereText, vigenereKey));
    } else {
      setVigenereResult(vigenereDecrypt(vigenereText, vigenereKey));
    }
  };

  const performCaesarOperation = (operation: "encrypt" | "decrypt") => {
    if (operation === "encrypt") {
      setCaesarResult(caesarEncrypt(caesarText, caesarShift));
    } else {
      setCaesarResult(caesarDecrypt(caesarText, caesarShift));
    }
  };

  const generateVigenereTable = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const table = [];
    
    for (let i = 0; i < 26; i++) {
      const row = [];
      for (let j = 0; j < 26; j++) {
        row.push(alphabet[(i + j) % 26]);
      }
      table.push(row);
    }
    
    return table;
  };

  const vigenereTable = generateVigenereTable();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Interactive Cryptography Laboratory</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vigenere" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vigenere">Vigenère Cipher</TabsTrigger>
              <TabsTrigger value="caesar">Caesar Cipher</TabsTrigger>
              <TabsTrigger value="analysis">Cryptanalysis</TabsTrigger>
            </TabsList>

            <TabsContent value="vigenere" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vigenère Cipher Tool</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The Vigenère cipher uses a repeating keyword to encrypt text with multiple Caesar ciphers.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vigenere-key">Encryption Key</Label>
                      <Input
                        id="vigenere-key"
                        value={vigenereKey}
                        onChange={(e) => setVigenereKey(e.target.value)}
                        placeholder="Enter keyword (e.g., APPLE)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vigenere-text">Text to Process</Label>
                      <Input
                        id="vigenere-text"
                        value={vigenereText}
                        onChange={(e) => setVigenereText(e.target.value)}
                        placeholder="Enter text to encrypt/decrypt"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => performVigenereOperation("encrypt")}>
                      <Lock className="w-4 h-4 mr-2" />
                      Encrypt
                    </Button>
                    <Button variant="outline" onClick={() => performVigenereOperation("decrypt")}>
                      <Unlock className="w-4 h-4 mr-2" />
                      Decrypt
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowVigenereTable(!showVigenereTable)}
                    >
                      {showVigenereTable ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showVigenereTable ? "Hide" : "Show"} Table
                    </Button>
                  </div>

                  {vigenereResult && (
                    <div>
                      <Label>Result</Label>
                      <div className="bg-muted p-3 rounded-lg font-mono text-lg">
                        {vigenereResult}
                      </div>
                    </div>
                  )}

                  {showVigenereTable && (
                    <div>
                      <Label>Vigenère Cipher Table</Label>
                      <div className="overflow-x-auto">
                        <table className="text-xs border-collapse border border-border">
                          <thead>
                            <tr>
                              <th className="border border-border p-1 bg-muted"></th>
                              {vigenereTable[0].map((_, j) => (
                                <th key={j} className="border border-border p-1 bg-muted">
                                  {String.fromCharCode(65 + j)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {vigenereTable.map((row, i) => (
                              <tr key={i}>
                                <th className="border border-border p-1 bg-muted">
                                  {String.fromCharCode(65 + i)}
                                </th>
                                {row.map((cell, j) => (
                                  <td key={j} className="border border-border p-1 text-center">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="caesar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Caesar Cipher Tool</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The Caesar cipher shifts each letter by a fixed number of positions in the alphabet.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="caesar-shift">Shift Value</Label>
                      <Input
                        id="caesar-shift"
                        type="number"
                        value={caesarShift}
                        onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
                        min="1"
                        max="25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="caesar-text">Text to Process</Label>
                      <Input
                        id="caesar-text"
                        value={caesarText}
                        onChange={(e) => setCaesarText(e.target.value)}
                        placeholder="Enter text to encrypt/decrypt"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => performCaesarOperation("encrypt")}>
                      <Lock className="w-4 h-4 mr-2" />
                      Encrypt
                    </Button>
                    <Button variant="outline" onClick={() => performCaesarOperation("decrypt")}>
                      <Unlock className="w-4 h-4 mr-2" />
                      Decrypt
                    </Button>
                  </div>

                  {caesarResult && (
                    <div>
                      <Label>Result</Label>
                      <div className="bg-muted p-3 rounded-lg font-mono text-lg">
                        {caesarResult}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Caesar Cipher Example</h4>
                    <p className="text-sm text-muted-foreground">
                      With shift 3: A→D, B→E, C→F... X→A, Y→B, Z→C
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cryptanalysis Techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Frequency Analysis</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Analyze letter frequency to break substitution ciphers.
                      </p>
                      <Badge variant="outline">Classical Cryptography</Badge>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Kasiski Examination</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Find repeated sequences to determine Vigenère key length.
                      </p>
                      <Badge variant="outline">Polyalphabetic Analysis</Badge>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Index of Coincidence</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Statistical method to distinguish between cipher types.
                      </p>
                      <Badge variant="outline">Statistical Analysis</Badge>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Brute Force</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Try all possible keys systematically.
                      </p>
                      <Badge variant="outline">Computational Method</Badge>
                    </Card>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Security Considerations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Classical ciphers are vulnerable to modern cryptanalysis</li>
                      <li>• Key length affects security (longer keys are stronger)</li>
                      <li>• Modern cryptography uses computational complexity</li>
                      <li>• Understanding historical methods helps analyze weaknesses</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}