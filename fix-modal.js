const fs = require('fs');
const path = './frontend/src/app/dashboard/(master-data)/clientes/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const handleSaveReplacement = 
  const handleSave = async () => {
    try {
      if (!formData.name?.trim()) {
        toast.error('O nome do cliente é obrigatório.');
        return;
      }
      if (!formData.phone?.trim()) {
        toast.error('O número de celular é obrigatório.');
        return;
      }
      
      const payload = {
        ...formData,
        type: formData.type || 'INDIVIDUAL'
      };
;

code = code.replace(
  '  const handleSave = async () => {\n    try {\n      const payload = {\n        ...formData,\n        type: formData.type || \'INDIVIDUAL\'\n      };',
  handleSaveReplacement.trim()
);

const formReplacement = 
          <div className="space-y-4">
            
            <div>
              <Label>Nome *</Label>
              <Input 
                value={formData['name'] || ''} 
                onChange={e => setFormData({ ...formData, 'name': e.target.value })} 
              />
            </div>
            
            <div>
              <Label>Número Celular *</Label>
              <Input 
                value={formData['phone'] || ''} 
                onChange={e => setFormData({ ...formData, 'phone': e.target.value })} 
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label>CPF / CNPJ (Opcional)</Label>
              <Input 
                value={formData['document'] || ''} 
                onChange={e => setFormData({ ...formData, 'document': e.target.value })} 
                placeholder="Apenas números ou com formatação"
              />
            </div>
;

code = code.replace(
  /<div className="space-y-4">\s*<div>\s*<Label>Nome<\/Label>\s*<Input\s*value=\{formData\['name'\] \|\| ''\}\s*onChange=\{e => setFormData\(\{ \.\.\.formData, 'name': e\.target\.value \}\)\}\s*\/>\s*<\/div>\s*<div>\s*<Label>N.mero Celular<\/Label>\s*<Input\s*value=\{formData\['phone'\] \|\| ''\}\s*onChange=\{e => setFormData\(\{ \.\.\.formData, 'phone': e\.target\.value \}\)\}\s*placeholder="\(00\) 00000-0000"\s*\/>\s*<\/div>/,
  formReplacement.trim()
);

fs.writeFileSync(path, code);
console.log('Modal fixed');
