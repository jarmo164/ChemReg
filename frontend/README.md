# ChemReg frontend

React frontend ChemRegi jaoks.

## Stack
- React 19
- React Router 7
- MUI 7
- styled-components
- react-scripts build chain

## Mida see kiht praegu teeb
- login ja sessiooni taastamine access/refresh tokenitega
- chemical product register UI
- SDS management live API peal
- SDS PDF upload + extraction review flow
- mini-SDS editor
- GPV A4 chemical card preview/export browserist
- inventory register UI

## Commands

Install:
```bash
npm install
```

Start dev server:
```bash
npm start
```

Run tests:
```bash
npm test
```

Build production bundle:
```bash
npm run build
```

## Notes
- `REACT_APP_API_URL` määrab backendi baasaadressi buildi ajal
- GPV chemical card on praegu frontend-side print/export flow, mitte veel backendi ametlik PDF generation
- SDS extraction tulemust tuleb UX-is käsitleda soovitusliku draftina, mitte automaatselt usaldatud lõppandmena
