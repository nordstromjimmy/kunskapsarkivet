export const metadata = {
  title: "Om • Kunskapsarvet",
  description: "Vad Kunskapsarvet är, varför det finns och hur du kan bidra.",
};

export default function AboutPage() {
  return (
    <article className="prose max-w-none">
      <h1>Om Kunskapsarvet</h1>
      <p>
        Kunskapsarvet är ett levande, gemenskapsdrivet arkiv för svensk
        vardagskunskap och traditioner – från slöjd och matförvaring till
        byggmetoder, ordspråk och gamla arbetsvanor. Tanken är enkel:
        <em> det som inte delas försvinner </em>. Här samlar vi hur saker
        gjordes, varför, och vad vi kan göra idag för att föra kunskapen vidare.
      </p>

      <h2 id="syfte">Syfte</h2>
      <ul>
        <li>
          <strong>Bevara:</strong> dokumentera tekniker, berättelser och ord som
          annars riskerar att gå förlorade.
        </li>
        <li>
          <strong>Dela:</strong> göra kunskapen lätt att hitta, lära och använda
          i nutiden.
        </li>
        <li>
          <strong>Föra vidare:</strong> visa konkreta sätt att praktisera och
          lära ut – workshops, handledning, lärlingar.
        </li>
      </ul>

      <h2 id="hur-funkar-det">Hur funkar det?</h2>
      <ol>
        <li>
          <strong>Lägg till ett inlägg:</strong> en kort titel,
          berättelse/beskrivning, och gärna foto/ljud/video.
        </li>
        <li>
          <strong>Avsluta med ”Vad kan göras idag?”:</strong> ett förslag på hur
          kunskapen kan hållas vid liv.
        </li>
        <li>
          <strong>Taggar & kategorier:</strong> hjälp andra att hitta (t.ex.
          “Slöjd & Hantverk”, “Mat & Förvaring”).
        </li>
      </ol>
      <br />
      <h2 id="riktlinjer">
        <strong>Riktlinjer & moderering</strong>
      </h2>
      <ul>
        <li>
          Håll en respektfull ton. Fokus på <em>kunskap</em>
        </li>
        <li>
          Var källmedveten: skriv vem du lärde dig av, var i landet, och ungefär
          när.
        </li>
        <li>
          Integritet: publicera bara material du har rätt att dela. Be om
          samtycke vid personbilder.
        </li>
      </ul>
      <br />
      <h2 id="sekretess">
        <strong>Sekretess</strong>
      </h2>
      <p>
        Vi samlar så lite persondata som möjligt. Du kan när som helst begära
        att ett inlägg tas bort.
      </p>
    </article>
  );
}
