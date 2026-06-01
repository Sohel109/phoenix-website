// ==========================================
// 1. SERVICES WEB (doGet et doPost pour le site)
// ==========================================

// Fonction pour permettre au Bureau de lister tous les membres (doGet)
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'listUsers') {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; // Prend la première feuille
    var data = sheet.getDataRange().getValues();
    var users = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1]) { // Si la colonne 'name' n'est pas vide
        users.push({
          id: data[i][0].toString(),
          name: data[i][1].toString()
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, users: users }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getPlanningData') {
    try {
      var planningData = getPlanningDataInternal();
      return ContentService.createTextOutput(JSON.stringify(planningData))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Action inconnue" }))
      .setMimeType(ContentService.MimeType.JSON);
}

// Fonction de login et d'écriture de planning (doPost)
function doPost(e) {
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  
  // Si c'est une action de planning
  if (action === 'syncBooking') {
    try {
      var sheet = getOrCreateSheet("Bookings", ["id", "slotId", "userId", "userName", "weekKey", "status", "validatedBy", "validatedAt"]);
      var data = sheet.getDataRange().getValues();
      var foundRow = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === postData.booking.id) {
          foundRow = i + 1;
          break;
        }
      }
      
      var rowValues = [
        postData.booking.id,
        postData.booking.slotId,
        postData.booking.userId,
        postData.booking.userName || "",
        postData.booking.weekKey,
        postData.booking.status,
        postData.booking.validatedBy || "",
        postData.booking.validatedAt || ""
      ];
      
      if (foundRow !== -1) {
        sheet.getRange(foundRow, 1, 1, 8).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  if (action === 'deleteBooking') {
    try {
      var sheet = getOrCreateSheet("Bookings", ["id", "slotId", "userId", "userName", "weekKey", "status", "validatedBy", "validatedAt"]);
      var data = sheet.getDataRange().getValues();
      var deletedCount = 0;
      
      // On parcourt à l'envers pour pouvoir supprimer plusieurs lignes sans décalage d'index
      for (var i = data.length - 1; i >= 1; i--) {
        var rowId = data[i][0] ? data[i][0].toString() : "";
        var rowSlotId = data[i][1] ? data[i][1].toString() : "";
        var rowUserId = data[i][2] ? data[i][2].toString() : "";
        var rowWeekKey = data[i][4] ? data[i][4].toString() : "";
        
        var matchesId = postData.id && rowId === postData.id.toString();
        var matchesTriplet = postData.userId && postData.slotId && postData.weekKey && 
                             rowUserId === postData.userId.toString() && 
                             rowSlotId === postData.slotId.toString() && 
                             rowWeekKey === postData.weekKey.toString();
                             
        if (matchesId || matchesTriplet) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, deletedCount: deletedCount }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  if (action === 'toggleWeekUnavailable') {
    try {
      var sheet = getOrCreateSheet("Indisponibilites", ["userId", "weekKey"]);
      var data = sheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === postData.userId && data[i][1] === postData.weekKey) {
          foundRow = i + 1;
          break;
        }
      }
      
      if (postData.isUnavailable) {
        if (foundRow === -1) {
          sheet.appendRow([postData.userId, postData.weekKey]);
        }
      } else {
        if (foundRow !== -1) {
          sheet.deleteRow(foundRow);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  if (action === 'syncEventAttendance') {
    try {
      var sheet = getOrCreateSheet("PresencesEvenements", ["userId", "eventId", "present"]);
      var data = sheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === postData.attendance.userId && data[i][1] === postData.attendance.eventId) {
          foundRow = i + 1;
          break;
        }
      }
      
      if (foundRow !== -1) {
        sheet.getRange(foundRow, 3).setValue(postData.attendance.present);
      } else {
        sheet.appendRow([postData.attendance.userId, postData.attendance.eventId, postData.attendance.present]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Par défaut, c'est l'action de login existante (inchangée)
  var login = postData.login;
  var password = postData.password;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == login && data[i][3] == password) {
      var user = {
        id: data[i][0].toString(),
        name: data[i][1].toString(),
        login: data[i][2].toString(),
        role: data[i][4].toString(),
        projectIds: data[i][5] ? data[i][5].toString().split(',').map(Number) : []
      };
      return ContentService.createTextOutput(JSON.stringify({ success: true, user: user }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Identifiants incorrects" }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ==========================================
// 3. FONCTIONS UTILITAIRES INTERNES
// ==========================================

// Récupère ou crée une feuille avec des en-têtes si elle n'existe pas
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

// Fonction interne pour lire toutes les tables de planning
function getPlanningDataInternal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Lire les bookings
  var bookings = [];
  var sheetBookings = getOrCreateSheet("Bookings", ["id", "slotId", "userId", "userName", "weekKey", "status", "validatedBy", "validatedAt"]);
  var dataBookings = sheetBookings.getDataRange().getValues();
  for (var i = 1; i < dataBookings.length; i++) {
    if (dataBookings[i][0]) {
      bookings.push({
        id: dataBookings[i][0].toString(),
        slotId: dataBookings[i][1].toString(),
        userId: dataBookings[i][2].toString(),
        userName: dataBookings[i][3].toString(),
        weekKey: dataBookings[i][4].toString(),
        status: dataBookings[i][5].toString(),
        validatedBy: dataBookings[i][6] ? dataBookings[i][6].toString() : undefined,
        validatedAt: dataBookings[i][7] ? dataBookings[i][7].toString() : undefined
      });
    }
  }
  
  // 2. Lire les indisponibilités
  var unavailableWeeks = [];
  var sheetIndisp = getOrCreateSheet("Indisponibilites", ["userId", "weekKey"]);
  var dataIndisp = sheetIndisp.getDataRange().getValues();
  for (var i = 1; i < dataIndisp.length; i++) {
    if (dataIndisp[i][0] && dataIndisp[i][1]) {
      unavailableWeeks.push(dataIndisp[i][0].toString() + "-" + dataIndisp[i][1].toString());
    }
  }
  
  // 3. Lire les présences événements
  var eventAttendance = [];
  var sheetEvent = getOrCreateSheet("PresencesEvenements", ["userId", "eventId", "present"]);
  var dataEvent = sheetEvent.getDataRange().getValues();
  for (var i = 1; i < dataEvent.length; i++) {
    if (dataEvent[i][0] && dataEvent[i][1]) {
      eventAttendance.push({
        userId: dataEvent[i][0].toString(),
        eventId: dataEvent[i][1].toString(),
        present: dataEvent[i][2] === true || dataEvent[i][2] === "true" || dataEvent[i][2] === "VRAI"
      });
    }
  }
  
  return {
    success: true,
    bookings: bookings,
    unavailableWeeks: unavailableWeeks,
    eventAttendance: eventAttendance
  };
}


// ==========================================
// 4. ENVOI DE MAIL DYNAMIQUE SUR CASE À COCHER (DÉJÀ CONFIGURÉ)
// ==========================================

function envoyerMailConnexion(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();
  
  var COLONNE_CASE_A_COCHER = 8; // Colonne H
  var COLONNE_EMAIL = 7;         // Colonne G
  var COLONNE_NOM = 2;           // Colonne B
  var COLONNE_LOGIN = 3;         // Colonne C
  var COLONNE_MDP = 4;           // Colonne D
  
  if (sheet.getName() !== e.source.getSheets()[0].getName()) {
    return;
  }
  
  if (row > 1 && col === COLONNE_CASE_A_COCHER && range.getValue() === true) {
    var nom = sheet.getRange(row, COLONNE_NOM).getValue();
    var email = sheet.getRange(row, COLONNE_EMAIL).getValue();
    var login = sheet.getRange(row, COLONNE_LOGIN).getValue();
    var mdp = sheet.getRange(row, COLONNE_MDP).getValue();
    
    if (!email || email.toString().indexOf("@") === -1) {
      SpreadsheetApp.getUi().alert("⚠️ Erreur : L'adresse email à la ligne " + row + " est absente ou invalide.");
      range.setValue(false);
      return;
    }
    
    if (!login || !mdp) {
      SpreadsheetApp.getUi().alert("⚠️ Erreur : L'identifiant ou le mot de passe est manquant pour " + (nom || "Ligne " + row) + ".");
      range.setValue(false);
      return;
    }
    
    var sujet = "🔑 Vos identifiants de connexion - Phoenix EDC";
    var messageHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background: #1A103C; padding: 25px; text-align: center;">
          <h2 style="color: #fff; margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 2px;">Phoenix Égalité des Chances</h2>
        </div>
        <div style="padding: 30px; background: #fff; line-height: 1.6;">
          <p>Bonjour <strong>${nom}</strong>,</p>
          <p>Bienvenue chez Phoenix ! Voici vos identifiants personnels pour accéder à votre espace de gestion et planning :</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF6B00;">
            <p style="margin: 5px 0; font-size: 15px;"><strong>Identifiant (Login) :</strong> <code>${login}</code></p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Mot de passe :</strong> <code>${mdp}</code></p>
          </div>
          
          <p>Pour vous connecter, rendez-vous sur : <a href="https://phoenixedc.asso.fr/planning" style="color: #FF6B00; font-weight: bold; text-decoration: none;">phoenixedc.asso.fr/planning</a></p>
          
          <br>
          <p>À très vite,</p>
          <p><strong>L'équipe Phoenix EDC</strong> 🦅</p>
        </div>
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 11px; color: #888;">
          Cet e-mail est automatisé. Merci de ne pas y répondre directement.
        </div>
      </div>
    `;
    
    try {
      MailApp.sendEmail({
        to: email.toString().trim(),
        subject: sujet,
        htmlBody: messageHtml
      });
      sheet.getRange(row, COLONNE_CASE_A_COCHER + 1).setValue("Envoyé le " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy à HH:mm"));
    } catch (error) {
      Logger.log("Erreur lors de l'envoi de l'email : " + error.toString());
      SpreadsheetApp.getUi().alert("❌ Impossible d'envoyer l'e-mail à la ligne " + row + " : " + error.toString());
      range.setValue(false);
    }
  }
}
