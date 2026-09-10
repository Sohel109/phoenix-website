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
      var duplicateRows = [];
      
      var targetId = postData.booking.id ? postData.booking.id.toString() : "";
      var targetUserId = postData.booking.userId ? postData.booking.userId.toString() : "";
      var targetSlotId = postData.booking.slotId ? postData.booking.slotId.toString() : "";
      var targetWeekKey = postData.booking.weekKey ? postData.booking.weekKey.toString() : "";
      
      for (var i = 1; i < data.length; i++) {
        var rowId = data[i][0] ? data[i][0].toString() : "";
        var rowSlotId = data[i][1] ? data[i][1].toString() : "";
        var rowUserId = data[i][2] ? data[i][2].toString() : "";
        var rowWeekKey = data[i][4] ? data[i][4].toString() : "";
        
        var matchesId = targetId !== "" && rowId === targetId;
        var matchesTriplet = targetUserId !== "" && targetSlotId !== "" && targetWeekKey !== "" &&
                             rowUserId === targetUserId && rowSlotId === targetSlotId && rowWeekKey === targetWeekKey;
                             
        if (matchesId || matchesTriplet) {
          if (foundRow === -1) {
            foundRow = i + 1;
          } else {
            duplicateRows.push(i + 1);
          }
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
      
      // Supprimer les doublons en partant de la fin pour conserver les bons index
      for (var d = duplicateRows.length - 1; d >= 0; d--) {
        sheet.deleteRow(duplicateRows[d]);
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
        if (data[i][0].toString() === postData.userId.toString() && data[i][1].toString() === postData.weekKey.toString()) {
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
        if (data[i][0].toString() === postData.attendance.userId.toString() && data[i][1].toString() === postData.attendance.eventId.toString()) {
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

  if (action === 'changePassword') {
    try {
      var userId = postData.userId ? postData.userId.toString().trim() : "";
      var oldPassword = postData.oldPassword ? postData.oldPassword.toString().trim() : "";
      var newPassword = postData.newPassword ? postData.newPassword.toString().trim() : "";

      if (!userId || !oldPassword || !newPassword) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Tous les champs sont requis." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      if (newPassword.length < 4) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Le nouveau mot de passe doit comporter au moins 4 caractères." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      var data = sheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 1; i < data.length; i++) {
        var rowId = data[i][0] ? data[i][0].toString().trim() : "";
        var rowPass = data[i][3] ? data[i][3].toString().trim() : "";

        if (rowId === userId) {
          if (rowPass !== oldPassword) {
            return ContentService.createTextOutput(JSON.stringify({ success: false, message: "L'ancien mot de passe est incorrect." }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow !== -1) {
        sheet.getRange(foundRow, 4).setValue(newPassword); // Colonne D (mot de passe)
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Votre mot de passe a été modifié avec succès !" }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Utilisateur non trouvé." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Par défaut, c'est l'action de login existante
  var login = postData.login ? postData.login.toString().trim() : "";
  var password = postData.password ? postData.password.toString().trim() : "";
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var sheetLogin = data[i][2] ? data[i][2].toString().trim() : "";
    var sheetPass = data[i][3] ? data[i][3].toString().trim() : "";
    
    if (sheetLogin === login && sheetPass === password) {
      var rawProjects = data[i][5] ? data[i][5].toString() : "";
      var projectIds = rawProjects
        .split(',')
        .map(function(item) { return parseInt(item.trim(), 10); })
        .filter(function(num) { return !isNaN(num); });

      var user = {
        id: data[i][0].toString(),
        name: data[i][1].toString(),
        login: sheetLogin,
        role: data[i][4].toString(),
        projectIds: projectIds
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
  
  // 1. Lire les bookings (avec déduplication)
  var bookingsMap = {};
  var sheetBookings = getOrCreateSheet("Bookings", ["id", "slotId", "userId", "userName", "weekKey", "status", "validatedBy", "validatedAt"]);
  var dataBookings = sheetBookings.getDataRange().getValues();
  for (var i = 1; i < dataBookings.length; i++) {
    if (dataBookings[i][0]) {
      var item = {
        id: dataBookings[i][0].toString(),
        slotId: dataBookings[i][1].toString(),
        userId: dataBookings[i][2].toString(),
        userName: dataBookings[i][3].toString(),
        weekKey: dataBookings[i][4].toString(),
        status: dataBookings[i][5].toString(),
        validatedBy: dataBookings[i][6] ? dataBookings[i][6].toString() : undefined,
        validatedAt: dataBookings[i][7] ? dataBookings[i][7].toString() : undefined
      };
      
      var key = item.userId + "_" + item.slotId + "_" + item.weekKey;
      var existing = bookingsMap[key];
      // Si déjà existant, privilégier le statut confirmé ou validé
      if (!existing || item.status === 'confirme' || item.status === 'absent') {
        bookingsMap[key] = item;
      }
    }
  }
  var bookings = [];
  for (var k in bookingsMap) {
    bookings.push(bookingsMap[k]);
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
// 4. ENVOI DE MAIL DYNAMIQUE SUR CASE À COCHER
// ==========================================

// Déclencheur automatique lors de la modification de la feuille
function onEdit(e) {
  if (e && e.range) {
    envoyerMailConnexion(e);
  }
}

function envoyerMailConnexion(e) {
  if (!e || !e.source || !e.range) return;

  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();
  
  var COLONNE_CASE_A_COCHER = 8; // Colonne H (Envoyer le mail)
  var COLONNE_EMAIL = 7;         // Colonne G (Adresse email)
  var COLONNE_NOM = 2;           // Colonne B (Nom prénom)
  var COLONNE_LOGIN = 3;         // Colonne C (Identifiant)
  var COLONNE_MDP = 4;           // Colonne D (Mot de passe)
  
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
    
    var sujet = "Phoenix EDC - Vos accès à votre espace planning";
    var siteUrl = "https://www.phoenix-egalite-des-chances.com/planning";
    
    var messageTexte = "Bonjour " + nom + ",\n\n"
      + "Bienvenue dans l'équipe Phoenix Égalité des Chances !\n\n"
      + "Voici vos identifiants personnels pour accéder à votre espace de gestion et planning :\n\n"
      + "• Identifiant (Login) : " + login + "\n"
      + "• Mot de passe : " + mdp + "\n\n"
      + "Pour vous connecter, rendez-vous sur le planning en ligne :\n"
      + siteUrl + "\n\n"
      + "💡 En cas de difficulté pour vous connecter ou pour toute question, vous pouvez contacter directement Sohel à l'adresse suivante : haggui.sohel@gmail.com (ou répondre simplement à cet e-mail).\n\n"
      + "À très vite,\n"
      + "L'équipe Phoenix Égalité des Chances\n"
      + "phoenixedc.asso@gmail.com";

    var messageHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; max-width: 580px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background: #1A103C; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; text-transform: uppercase; font-size: 17px; letter-spacing: 2px; font-weight: 800;">Phoenix Égalité des Chances</h2>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 12px;">Espace Tuteurs & Bénévoles</p>
        </div>
        
        <div style="padding: 28px 24px; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">Bonjour <strong>${nom}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">Bienvenue dans l'équipe ! Voici vos identifiants personnels pour vous connecter à votre espace tuteur sur notre site :</p>
          
          <div style="background: #f8fafc; padding: 18px 20px; border-radius: 10px; margin: 22px 0; border: 1px solid #e2e8f0; border-left: 4px solid #FF6B00;">
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">
              <strong style="color: #0f172a;">Identifiant :</strong> 
              <span style="font-family: monospace; font-size: 15px; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-left: 6px; color: #0f172a;">${login}</span>
            </p>
            <p style="margin: 10px 0 4px 0; font-size: 14px; color: #1e293b;">
              <strong style="color: #0f172a;">Mot de passe :</strong> 
              <span style="font-family: monospace; font-size: 15px; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-left: 6px; color: #0f172a;">${mdp}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="${siteUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B00, #7C3AED); color: #ffffff; padding: 12px 28px; border-radius: 50px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.25);">
              Accéder au Planning
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 20px;">
            Lien direct : <a href="${siteUrl}" style="color: #FF6B00;">${siteUrl}</a>
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #334155; line-height: 1.5;">
            <strong>Besoin d'aide pour vous connecter ?</strong><br/>
            En cas de problème technique ou d'identifiant incorrect, vous pouvez contacter directement <strong>Sohel</strong> à l'adresse suivante : <a href="mailto:haggui.sohel@gmail.com" style="color: #7C3AED; font-weight: 600; text-decoration: underline;">haggui.sohel@gmail.com</a> (ou en répondant simplement à cet e-mail).
          </div>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
          
          <p style="font-size: 14px; margin: 0; color: #334155;">À très bientôt,</p>
          <p style="font-size: 14px; font-weight: bold; margin: 4px 0 0 0; color: #0f172a;">L'équipe Phoenix Égalité des Chances 🦅</p>
        </div>
        
        <div style="background: #f8fafc; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          Phoenix Égalité des Chances • Support : <a href="mailto:haggui.sohel@gmail.com" style="color: #64748b; text-decoration: underline;">haggui.sohel@gmail.com</a> ou <a href="mailto:phoenixedc.asso@gmail.com" style="color: #64748b; text-decoration: underline;">phoenixedc.asso@gmail.com</a>
        </div>
      </div>
    `;
    
    try {
      // 1. Priorité à GmailApp : envoyé depuis l'authentique boîte Gmail, stocké dans les envoyés
      GmailApp.sendEmail(email.toString().trim(), sujet, messageTexte, {
        htmlBody: messageHtml,
        name: "Phoenix Égalité des Chances",
        replyTo: "phoenixedc.asso@gmail.com"
      });
      sheet.getRange(row, COLONNE_CASE_A_COCHER + 1).setValue("Envoyé le " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy à HH:mm"));
    } catch (error) {
      // 2. Fallback avec MailApp si le quota ou les permissions GmailApp diffèrent
      try {
        MailApp.sendEmail({
          to: email.toString().trim(),
          subject: sujet,
          body: messageTexte,
          htmlBody: messageHtml,
          name: "Phoenix Égalité des Chances",
          replyTo: "phoenixedc.asso@gmail.com"
        });
        sheet.getRange(row, COLONNE_CASE_A_COCHER + 1).setValue("Envoyé le " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy à HH:mm"));
      } catch (errFallback) {
        Logger.log("Erreur lors de l'envoi de l'email : " + errFallback.toString());
        SpreadsheetApp.getUi().alert("❌ Impossible d'envoyer l'e-mail à la ligne " + row + " : " + errFallback.toString());
        range.setValue(false);
      }
    }
  }
}
