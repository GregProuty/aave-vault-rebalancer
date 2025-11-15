'use client';

import React from 'react';
import { useMessageState } from '@/contexts/MessageStateContext';
import { useWelcome } from '@/contexts/WelcomeContext';
import { WELCOME, WELCOME_BACK } from '@/constants/messages';
import { Message } from '@/components/Message';
import { useMessages } from '@/hooks/useMessages';
import { useDeposit } from '@/contexts/DepositContext';

const StatusPanelFigma = () => {
  const { primaryMessage } = useMessageState();
  const { yieldEarned, dismissWelcome } = useWelcome();
  const { showDepositInfo } = useMessages();
  const { triggerDeposit } = useDeposit();

  const handleHelpClick = () => {
    showDepositInfo();
  };

  const handleGetStartedClick = () => {
    // Trigger deposit and dismiss welcome message
    triggerDeposit();
    dismissWelcome();
  };

  // Icon/color helpers not used in current design; remove to satisfy linter

  return (
    <div className="text-white w-full space-y-3">
      {/* Header with logo and title */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Yieldr Logo */}
        <img src="/logo.svg" alt="Yieldr" className="w-11 h-11" />
        {/* <h1 className="text-lg font-medium text-white">YIELDR</h1> */}
      </div>

      {/* Status messages using new state system */}
      {primaryMessage ? (
        <Message
          type={primaryMessage.type}
          category={primaryMessage.category}
          id={primaryMessage.id}
          persistent={primaryMessage.persistent}
        >
          {primaryMessage.category === 'welcome-back' ? (
            <p>
              {WELCOME_BACK.PREFIX}
              {yieldEarned} {WELCOME_BACK.CURRENCY}
              {WELCOME_BACK.SUFFIX}
            </p>
          ) : primaryMessage.category === 'welcome' ? (
            <div>
              <h3 className="text-white text-2xl font-semibold mb-2 font-display">{WELCOME.TITLE}</h3>
              <p className="text-white text-sm leading-relaxed mb-4">
                {WELCOME.DESCRIPTION}
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleHelpClick}
                  className="w-[100px] py-2 rounded-md border border-gray4 text-primary bg-transparent font-medium text-sm"
                >
                  {WELCOME.BUTTONS.HELP}
                </button>
                <button 
                  onClick={handleGetStartedClick}
                  className="flex-1 py-2 rounded-md bg-white text-black font-medium text-sm"
                >
                  {WELCOME.BUTTONS.GET_STARTED}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {primaryMessage.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? 'mt-4' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </Message>
      ) : null}
    </div>
  );
};

export default StatusPanelFigma;
